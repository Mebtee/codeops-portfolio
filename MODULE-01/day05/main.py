# Goal
# Build the first version of the Addis Bank Account class — encapsulated balance,
# validated deposits and withdrawals. This is the start of your larger project.

# Steps
# 1. Define Account with owner, account_number, and a private __balance.
# 2. Add a @property to read the balance (no direct edits).
# 3. Write deposit() and withdraw() that validate the amount.
# 4. Reject negative deposits and overdrafts with a clear message.
# 5. Create two accounts, run some transactions, and push to day04.

class Account:
    def __init__(self, owner, account_number, balance):
        self.owner = owner
        self.account_number = account_number
        self.__balance = balance
    
    @property
    def balance(self):
        return self.__balance
    
    def deposite(self, amount):
        if amount > 0:
            self.__balance += amount
        else:
            print("deposite amount must be greater than 0")
    def withdraw(self, amount):
        if self.__balance - amount >= 0:
            self.__balance -= amount
        else:
            print("Insufficient funds")


# user1 =Account("Tamene", 10003020, 100)
# user2 =Account("Abebe", 10003021, 200)

# print(f"{user1.owner} has a balance of {user1.balance}")
# print(f"{user2.owner} has a balance of {user2.balance}")


# user1.deposite(10)
# user2.deposite(20)

# print(f"{user1.owner} has a balance of {user1.balance}")
# print(f"{user2.owner} has a balance of {user2.balance}")

# user1.withdraw(10)
# user2.withdraw(20)

# print(f"{user1.owner} has a balance of {user1.balance}")
# print(f"{user2.owner} has a balance of {user2.balance}")









# Goal
# Extend yesterday's Account into SavingsAccount and CurrentAccount, then drive
# them all through one polymorphic loop.

# Steps
# 1. Open day04/account.py; copy it into day05/ to grow it.
# 2. Add SavingsAccount with a rate and add_interest().
# 3. Add CurrentAccount with an overdraft and an overridden withdraw().
# 4. Override statement() in each so it labels the account type.
# 5. Loop over a mixed list and call statement(); push to day05.

class SavingsAccount(Account):
    def __init__(self, owner, account_number, balance, rate):
        super().__init__(owner, account_number, balance)
        self.rate = rate

    def add_interest(self):
        interest = self.balance * self.rate
        self.deposite(interest)

    def statement(self):
        print(f"Savings Account - Owner: {self.owner}, Account Number: {self.account_number}, Balance: {self.balance} ETB, Interest Rate: {self.rate*100}%")


class CurrentAccount(Account):
    def __init__(self, owner, account_number, balance, overdraft):
        super().__init__(owner, account_number, balance)
        self.overdraft = overdraft

    def withdraw(self, amount):
        if self.balance - amount >= 0:
            self._Account__balance -= amount 
        else:
            print("Insufficient funds for this withdrawal.")

    def statement(self):
        print(f"Current Account - Owner: {self.owner}, Account Number: {self.account_number}, Balance: {self.balance} ETB, Overdraft Limit: {self.overdraft} ETB")        


user1 = SavingsAccount("Tamene", 10003020, 1000, 0.05)
user2 = CurrentAccount("Abebe", 10003021, 2000, 50)    

user1.statement()
user2.statement()

user2.withdraw(1200)  
user2.statement()