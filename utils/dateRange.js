const  getCurrentMonthDateRange = () =>{
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month
  
    return { startOfMonth, endOfMonth };
  }
  
module.exports = { getCurrentMonthDateRange };
  