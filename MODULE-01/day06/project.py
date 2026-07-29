
# What you will build
# A refactored bank.py in which an AccountFactory creates accounts by type, an Observer sends
# alerts on transactions, and a BankConfig Singleton holds the shared rates and limits.
# Requirements
# • Apply SRP: move notification out of Account into a separate observer; keep Account focused on
# balance logic.
# • Add an AccountFactory.create(kind, owner, number, balance=0) for the savings and current
# types.
# • Add subscribe() and _notify() to Account, plus an SMSAlert and an AuditLog observer.
# • Add a BankConfig Singleton for the interest rate and overdraft limit; read it from your account
# classes.

from abc import ABC, abstractmethod

class BankConfig:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BankConfig, cls).__new__(cls)
            cls._instance.savings_rate = 0.05
            cls._instance.overdraft_limit = 1000
        return cls._instance


class Observer(ABC):
    @abstractmethod
    def update(self, message):
        pass

class SMSAlert(Observer):
    def __init__(self, phone_number):
        self.phone_number = phone_number

    def update(self, message):
        print(f"[SMS ALERT to {self.phone_number}]: {message}")

class AuditLog(Observer):
    def update(self, message):
        print(f"[AUDIT LOG]: {message}")


class Account:
    def __init__(self, owner, account_number, balance=0):
        self.owner = owner
        self.account_number = account_number
        self.__balance = balance
        self._observers = []

    @property
    def balance(self):
        return self.__balance

    def subscribe(self, observer):
        self._observers.append(observer)

    def _notify(self, message):
        for observer in self._observers:
            observer.update(message)

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
            self._notify(f"Deposit of {amount} ETB. New balance: {self.__balance} ETB.")
        else:
            print("Deposit amount must be greater than zero.")

    def withdraw(self, amount):
        if amount <= 0:
            print("Withdrawal amount must be greater than zero.")
        elif amount > self.__balance:
            print("Insufficient funds for this withdrawal.")
        else:
            self.__balance -= amount
            self._notify(f"Withdrawal of {amount} ETB. New balance: {self.__balance} ETB.")

    def statement(self):
        print(f"Owner: {self.owner}, Account Number: {self.account_number}, Balance: {self.__balance} ETB.")


class SavingsAccount(Account):
    def __init__(self, owner, account_number, balance=0):
        super().__init__(owner, account_number, balance)
        self.rate = BankConfig().savings_rate

    def add_interest(self):
        interest = self.balance * self.rate
        if interest > 0:
            self.deposit(interest)

    def statement(self):
        print(f"Savings Account - Owner: {self.owner}, Account Number: {self.account_number}, Balance: {self.balance} ETB, Interest Rate: {self.rate*100}%")


class CurrentAccount(Account):
    def __init__(self, owner, account_number, balance=0):
        super().__init__(owner, account_number, balance)
        self.overdraft_limit = BankConfig().overdraft_limit

    def withdraw(self, amount):
        if amount <= 0:
            print("Withdrawal amount must be greater than zero.")
        elif self.balance - amount < -self.overdraft_limit:
            print(f"Insufficient funds. Maximum available (with overdraft) is {self.balance + self.overdraft_limit} ETB.")
        else:
            self._Account__balance -= amount  
            self._notify(f"Withdrawal of {amount} ETB. New balance: {self.balance} ETB.")

    def statement(self):
        print(f"Current Account - Owner: {self.owner}, Account Number: {self.account_number}, Balance: {self.balance} ETB, Overdraft Limit: {self.overdraft_limit} ETB")


class AccountFactory:
    @staticmethod
    def create(kind, owner, number, balance=0):
        kind = kind.lower()
        if kind == "savings":
            return SavingsAccount(owner, number, balance)
        elif kind == "current":
            return CurrentAccount(owner, number, balance)
        else:
            raise ValueError(f"Unknown account type: {kind}")


if __name__ == "__main__":
    BankConfig().savings_rate = 0.07   
    BankConfig().overdraft_limit = 2000  

    tamene_acc = AccountFactory.create("savings", "Tamene", "10003020", balance=1000)
    abebe_acc = AccountFactory.create("current", "Abebe", "10003021", balance=500)

    sms_service = SMSAlert("+251-911-000000")
    audit_service = AuditLog()

    tamene_acc.subscribe(sms_service)
    tamene_acc.subscribe(audit_service)
    
    abebe_acc.subscribe(audit_service) 


    tamene_acc.statement()
    tamene_acc.deposit(500)
    tamene_acc.add_interest()

    abebe_acc.statement()
    abebe_acc.withdraw(2000)
    abebe_acc.withdraw(1000) 