import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Expense from '@/lib/models/Expense';
import { getSpendingInsights } from '@/app/utils/calculations';

interface AiInsightPayload {
  insightText: string;
  recommendations: string[];
  generatedBy: 'openai' | 'fallback';
}

function buildFallbackInsights(insightData: ReturnType<typeof getSpendingInsights>): AiInsightPayload {
  const categorySorted = [...insightData.categoryPercentages].sort(
    (a, b) => Number(b.percentage) - Number(a.percentage)
  );
  const topCategory = categorySorted[0];

  const memberSorted = Object.entries(insightData.memberSpending)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ name, amount }));

  const topPayer = memberSorted[0];
  const total = insightData.totalSpent;
  const trend = insightData.weeklyTrend;
  const trendLine =
    trend.direction === 'flat'
      ? 'Spending is flat week-over-week.'
      : `You spent ${Math.abs(trend.percentageChange).toFixed(2)}% ${trend.direction === 'up' ? 'more' : 'less'} this week compared to last week.`;

  const insightText = topCategory
    ? `Your group spent Rs.${total.toFixed(2)} in total. The highest spend category is ${topCategory.category} at ${topCategory.percentage}% of all expenses${topPayer ? `, and ${topPayer.name} contributed the most (Rs.${topPayer.amount.toFixed(2)}).` : '.'} ${trendLine}`
    : `Your group spent Rs.${total.toFixed(2)} in total. ${trendLine} Add a few more expenses to unlock stronger category insights.`;

  const recommendations: string[] = [];

  if (topCategory && Number(topCategory.percentage) >= 40) {
    recommendations.push(
      `Set a soft cap for ${topCategory.category} expenses because this category is dominating your budget.`
    );
  }

  if (memberSorted.length > 0) {
    recommendations.push(
      'Settle balances weekly to prevent one person from carrying the group cost for too long.'
    );
  }

  if (trend.direction === 'up' && Math.abs(trend.percentageChange) > 20) {
    recommendations.push('This week is significantly higher than last week. Review discretionary expenses early.');
  }

  recommendations.push('Tag each expense clearly to improve AI category accuracy and future insights.');

  return {
    insightText,
    recommendations,
    generatedBy: 'fallback',
  };
}

async function generateOpenAiInsights(
  insightData: ReturnType<typeof getSpendingInsights>
): Promise<AiInsightPayload | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = {
    totalSpent: insightData.totalSpent,
    categoryPercentages: insightData.categoryPercentages,
    memberSpending: insightData.memberSpending,
    weeklyTrend: insightData.weeklyTrend,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'You are a financial assistant for group expense tracking. Return only valid JSON with keys: insightText (string), recommendations (array of 3 short strings).',
        },
        {
          role: 'user',
          content: `Create concise spending insights from this data: ${JSON.stringify(prompt)}`,
        },
      ],
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') return null;

  try {
    const parsed = JSON.parse(content) as { insightText?: string; recommendations?: string[] };
    if (!parsed.insightText || !Array.isArray(parsed.recommendations)) return null;

    return {
      insightText: parsed.insightText,
      recommendations: parsed.recommendations.slice(0, 3),
      generatedBy: 'openai',
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const groupId = request.nextUrl.searchParams.get('groupId');
    if (!groupId) {
      return NextResponse.json({ success: false, error: 'groupId is required' }, { status: 400 });
    }

    const expenses = await Expense.find({ groupId });
    const insightData = getSpendingInsights(expenses);

    const aiInsights = (await generateOpenAiInsights(insightData)) || buildFallbackInsights(insightData);

    return NextResponse.json({
      success: true,
      data: {
        ...insightData,
        ai: aiInsights,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate AI insights',
      },
      { status: 500 }
    );
  }
}