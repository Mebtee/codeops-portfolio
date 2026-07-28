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


user1 =Account("Tamene", 10003020, 100)
user2 =Account("Abebe", 10003021, 200)

print(f"{user1.owner} has a balance of {user1.balance}")
print(f"{user2.owner} has a balance of {user2.balance}")

print(user1.deposite(10))
print(user2.deposite(20))


