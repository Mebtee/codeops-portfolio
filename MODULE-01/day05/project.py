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
        
# user1 = Account("tamene", "1234567890", 1000)
# user2 = Account("behailu", "0987654321", 5000)

# user1.statement()
# user1.deposit(500)
# user1.withdraw(200)

# user1.statement()

# user2.statement()
# user2.withdraw(6000)  # try to withdraw more than the balance
# user2.deposit(-100)  # try to deposit a negative amount
# user2.deposit(1000)
# user2.statement()



# What you will build
# Two new account types that inherit from Account: a SavingsAccount that earns interest, and a
# CurrentAccount that allows an overdraft — then drive them all through one polymorphic loop.
# Requirements
# • SavingsAccount extends Account with a rate and an add_interest() method that reuses
# deposit().
# • CurrentAccount extends Account with an overdraft limit and an overridden withdraw() that
# allows balances down to the overdraft.
# • Override statement() in each subclass so it labels the account type.
# • Use super().__init__() in both subclasses; don't duplicate the parent's setup.


class SavingsAccount(Account):
    def __init__(self, owner, account_number, balance, rate):
        super().__init__(owner, account_number, balance)
        self.rate = rate

    def add_interest(self):
        interest = self.balance * self.rate
        self.deposit(interest)

    def statement(self):
        print(f"Savings Account - Owner: {self.owner}, Account Number: {self.account_number}, Balance: {self.balance} ETB, Interest Rate: {self.rate*100}%")

class CurrentAccount(Account):
    def __init__(self, owner, account_number, balance, overdraft_limit):
        super().__init__(owner, account_number, balance)
        self.overdraft_limit = overdraft_limit

    def withdraw(self, amount):
        if amount <= 0:
            print("Withdrawal amount must be greater than zero.")
        elif self.balance - amount < -self.overdraft_limit:
            print("Insufficient funds for this withdrawal, overdraft limit exceeded.")
        else:
            self._Account__balance -= amount  
            print(f"Withdrew {amount} ETB. New balance: {self.balance} ETB.")

    def statement(self):
        print(f"Current Account - Owner: {self.owner}, Account Number: {self.account_number}, Balance: {self.balance} ETB, Overdraft Limit: {self.overdraft_limit} ETB")


user1 = SavingsAccount("Tamene", "1234567890", 1000, 0.05)
user2 = CurrentAccount("Abebe", "0987654321", 500, 1000)

user1.statement()
user2.statement()

user1.add_interest()
user1.statement()

user2.withdraw(600) 
user2.statement()