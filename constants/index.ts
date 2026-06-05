export const sidebarLinks = [
  {
    imgURL: '/icons/home.svg',
    route: '/',
    label: 'Home',
  },
  {
    imgURL: '/icons/dollar-circle.svg',
    route: '/my-banks',
    label: 'My Banks',
  },
  {
    imgURL: '/icons/transaction.svg',
    route: '/transaction-history',
    label: 'Transaction History',
  },
  {
    imgURL: '/icons/money-send.svg',
    route: '/payment-transfer',
    label: 'Transfer Funds',
  },
];

export const transactionCategoryStyles = {
  'Food and Drink': {
    borderColor: 'border-pink-600',
    backgroundColor: 'bg-pink-500',
    textColor: 'text-pink-700',
    chipBackgroundColor: 'bg-inherited',
  },
  Payment: {
    borderColor: 'border-success-600',
    backgroundColor: 'bg-green-600',
    textColor: 'text-success-700',
    chipBackgroundColor: 'bg-inherited',
  },
  Transfer: {
    borderColor: 'border-red-700',
    backgroundColor: 'bg-red-700',
    textColor: 'text-red-700',
    chipBackgroundColor: 'bg-inherited',
  },
  Travel: {
    borderColor: 'border-indigo-300',
    backgroundColor: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    chipBackgroundColor: 'bg-indigo-100',
  },
  default: {
    borderColor: 'border-blue-300',
    backgroundColor: 'bg-blue-500',
    textColor: 'text-blue-700',
    chipBackgroundColor: 'bg-blue-100',
  },
};
