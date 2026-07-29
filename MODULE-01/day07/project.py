# What you will build
# An AccountRegistry that stores accounts in a dict keyed by account number for instant lookup,
# lists them in order, and tracks each account's transactions on a stack so the latest can be undone.
# Requirements
# • Store accounts in a dict keyed by account number; add(acc) and find(number) must be O(1).
# • Add list_all() that returns accounts in insertion order (use a list alongside the dict).
# • Give each account a history stack; push a record on every deposit and withdrawal.
# • Add undo_last() that pops the most recent transaction and reverses its effect.


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
        self._history = []

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
            self._history.append(('deposit', amount))  
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
            self._history.append(('withdraw', amount)) 
            self._notify(f"Withdrawal of {amount} ETB. New balance: {self.__balance} ETB.")

    def undo_last(self):
        if not self._history:
            print("No transactions to undo.")
            return
        
        action, amount = self._history.pop() 
        if action == 'deposit':
            self.__balance -= amount
            self._notify(f"Undo applied: Reversed deposit of {amount} ETB. New balance: {self.__balance} ETB.")
        elif action == 'withdraw':
            self.__balance += amount
            self._notify(f"Undo applied: Reversed withdrawal of {amount} ETB. New balance: {self.__balance} ETB.")

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
            self._history.append(('withdraw', amount)) 
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


class AccountRegistry:
    def __init__(self):
        self._accounts_dict = {}
        self._accounts_list = []

    def add(self, account):
        if account.account_number not in self._accounts_dict:
            self._accounts_dict[account.account_number] = account
            self._accounts_list.append(account)
        else:
            print(f"Account {account.account_number} already exists in the registry.")

    def find(self, account_number):
        return self._accounts_dict.get(account_number, None)

    def list_all(self):
        return self._accounts_list


if __name__ == "__main__":
    BankConfig().savings_rate = 0.07   
    BankConfig().overdraft_limit = 2000  

    registry = AccountRegistry()

    tamene_acc = AccountFactory.create("savings", "Tamene", "10003020", balance=1000)
    abebe_acc = AccountFactory.create("current", "Abebe", "10003021", balance=500)

    registry.add(tamene_acc)
    registry.add(abebe_acc)

    sms_service = SMSAlert("+251-911-000000")
    audit_service = AuditLog()

    tamene_acc.subscribe(sms_service)
    tamene_acc.subscribe(audit_service)
    abebe_acc.subscribe(audit_service) 

    for acc in registry.list_all():
        acc.statement()
    print("-" * 26)

    tamene_acc.deposit(500)
    tamene_acc.add_interest()

    abebe_acc.withdraw(2000)
    abebe_acc.withdraw(1000)  

    tamene_acc.undo_last()
    tamene_acc.statement()

    abebe_acc.undo_last()
    abebe_acc.statement()

    found_acc = registry.find("10003020")
    if found_acc:
        found_acc.statement()