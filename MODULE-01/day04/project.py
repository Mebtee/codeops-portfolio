# What you will build
# The first version of Addis Bank — Account Management System: an Account class with an
# owner, an account number, and a private balance that can only change through validated deposit
# and withdraw methods.
# Requirements
# • Define Account with public owner and account_number, and a private __balance (default 0).
# • Expose the balance through a read-only @property — no direct edits from outside.
# • Write deposit(amount) and withdraw(amount) that reject non-positive amounts and overdrafts.
# • Add a statement() method that prints the owner, account number, and balance in ETB.


class Account:
    def __init__(self, owner, account_number, balance=0):
        self.owner = owner
        self.account_number = account_number
        self.__balance = balance

    @property
    def balance(self):
        return self.__balance

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
        else:
            print("Deposit amount must be greater than zero.")

    def withdraw(self, amount):
        if amount <= 0:
            print("Withdrawal amount must be greater than zero.")
        elif amount > self.__balance:
            print("Insufficient funds for this withdrawal.")
        else:
            self.__balance -= amount
            print(f"Withdrew {amount} ETB. New balance: {self.__balance} ETB.")

    def statement(self):
        print(f"Owner: {self.owner}, Account Number: {self.account_number}, Balance: {self.__balance} ETB.")
        
user1 = Account("tamene", "1234567890", 1000)
user2 = Account("behailu", "0987654321", 5000)

user1.statement()
user1.deposit(500)
user1.withdraw(200)

user1.statement()

user2.statement()
user2.withdraw(6000)  # try to withdraw more than the balance
user2.deposit(-100)  # try to deposit a negative amount
user2.deposit(1000)
user2.statement()