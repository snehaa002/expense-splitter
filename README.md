# 💰 Smart Expense Splitter

A lightweight, intelligent web application for managing shared expenses among friends, roommates, and teams. Built with modern web technologies and AI-powered features for automatic expense categorization and spending insights.

## 🌟 Features

### Core Features
- **Group Management**: Create groups and add members easily
- **Expense Tracking**: Log all shared expenses with detailed descriptions
- **Smart Splitting**: Split expenses equally or with custom amounts
- **Real-Time Balances**: View who owes whom instantly
- **Settlement Calculations**: Get clear settlement instructions to resolve debts

### AI-Powered Features
- **Automatic Categorization**: Expenses are auto-categorized (food, travel, accommodation, entertainment, utilities, other)
- **Spending Analytics**: Visual breakdown of spending by category and member
- **Smart Insights**: AI-powered insights about spending patterns

### UI/UX Features
- **Beautiful Dashboard**: Modern, intuitive interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Expense History**: Complete history of all transactions
- **Visual Analytics**: Charts and breakdowns of spending patterns

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **Backend**: Next.js API Routes
- **Calculations**: Custom expense splitting algorithm
- **AI**: Built-in smart categorization (extensible with OpenAI)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB database (local or cloud)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/snehaa002/expense-splitter.git
cd expense-splitter
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-splitter?retryWrites=true&w=majority

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000


```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

## 📚 Project Structure

```
expense-splitter/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── groups/            # Group management endpoints
│   │   └── expenses/          # Expense management endpoints
│   ├── components/            # Reusable React components
│   │   ├── GroupForm.tsx      # Group creation form
│   │   ├── GroupCard.tsx      # Group card display
│   │   ├── ExpenseForm.tsx    # Expense creation form
│   │   ├── ExpenseList.tsx    # Expense listing
│   │   ├── BalanceSheet.tsx   # Balance display
│   │   └── Insights.tsx       # Analytics & insights
│   ├── groups/
│   │   └── [id]/
│   │       └── page.tsx       # Group detail page
│   ├── utils/
│   │   └── calculations.ts    # Core expense splitting logic
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── lib/
│   ├── db.ts                  # Database connection
│   └── models/
│       ├── Group.ts           # Group schema
│       └── Expense.ts         # Expense schema
├── public/                    # Static assets
├── .env.local                 # Environment variables
└── package.json               # Dependencies
```

## 🔌 API Endpoints

### Groups

**GET** `/api/groups` - Get all groups
- Response: `{ success: true, data: [...groups] }`

**POST** `/api/groups` - Create a new group
- Body: `{ name: string, description?: string, members: string[] }`
- Response: `{ success: true, data: {...group} }`

**GET** `/api/groups/[id]` - Get group details with expenses and balances
- Response: `{ success: true, data: { group, expenses, balances, settlements } }`

**PUT** `/api/groups/[id]` - Update group
- Body: `{ name?: string, description?: string, members?: string[] }`

**DELETE** `/api/groups/[id]` - Delete group and all related expenses

### Expenses

**GET** `/api/expenses?groupId=[id]` - Get all expenses for a group

**POST** `/api/expenses` - Create new expense
- Body: `{ groupId: string, description: string, amount: number, paidBy: string, splitAmong: string[], splitType?: 'equal' | 'custom' }`
- Response: `{ success: true, data: {...expense} }`

**DELETE** `/api/expenses/[id]` - Delete expense

## 💡 Core Algorithm

### Expense Splitting

The application uses a sophisticated algorithm to calculate who owes whom:

1. **Track Balances**: For each member, calculate total paid minus total owed
2. **Identify Debtors & Creditors**: Separate members into those owing money and those owed
3. **Minimize Transactions**: Use greedy algorithm to minimize settlement transactions

### Smart Categorization

Expenses are automatically categorized based on keywords in the description:
- **Food**: "food", "restaurant", "lunch", "dinner", "breakfast"
- **Travel**: "taxi", "uber", "travel", "flight", "train"
- **Accommodation**: "hotel", "stay", "airbnb"
- **Entertainment**: "movie", "game", "show"
- **Utilities**: "electricity", "water", "internet"

## 📊 Example Usage

### 1. Create a Group
```
Name: "Trip to Goa"
Description: "Summer vacation with friends"
Members: Alice, Bob, Charlie
```

### 2. Add Expenses
```
- Alice paid ₹3000 for food (split equally among 3)
- Bob paid ₹6000 for accommodation (split equally among 3)
- Charlie paid ₹1200 for travel (split equally among 3)
```

### 3. View Settlements
```
- Bob owes Alice ₹1000
- Charlie owes Alice ₹500
- Charlie owes Bob ₹200
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with one click!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Build the project: `npm run build`
2. Connect your GitHub repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Deploy!

## 🎨 UI/UX Features

- **Gradient Backgrounds**: Modern gradient design
- **Responsive Grid Layout**: Adapts to all screen sizes
- **Color-Coded Categories**: Easy identification of expense types
- **Real-Time Updates**: Instant balance calculations
- **Smooth Animations**: Fade-in effects and transitions
- **Accessibility**: Keyboard navigation support

## 🔐 Security Considerations

- Input validation on all endpoints
- MongoDB connection string stored securely
- Environment variables for sensitive data
- CORS headers configured
- Rate limiting recommended for production

## 📈 Future Enhancements

- User authentication and accounts
- Photo upload for receipts
- Multiple currency support
- Email notifications for settlements
- Mobile app (React Native)
- Advanced analytics with charts
- Recurring expenses
- Payment gateway integration
- Multi-language support
- Dark mode

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Verify credentials

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node version: `node --version`

### Environment Variables Not Loading
- Rename file to `.env.local` (not `.env`)
- Restart development server
- Check for typos in variable names

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


**Built with ❤️ for managing shared expenses smartly**
