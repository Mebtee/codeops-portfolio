# What you will build
# Three additions to the AccountRegistry: a top_by_balance(n) leaderboard, a
# find_by_number(number) that uses binary search over sorted account numbers, and a recursive
# total_transactions(number).
# Requirements
# • Add top_by_balance(n) using sorted(key=lambda a: a.balance, reverse=True); return the top
# n.
# • Write your own binary_search and use it in find_by_number(number) over the sorted account
# numbers.
# • Add a recursive total_transactions(number) that sums one account's transaction history.
# • Do not use the in operator or a loop for the number search — the point is to practise binary
# search.


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

    @property
    def history(self):
        return self._history

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

    def top_by_balance(self, n):
        return sorted(self._accounts_list, key=lambda a: a.balance, reverse=True)[:n]

    def _recursive_binary_search(self, sorted_accounts, target, low, high):
        if low > high:
            return None
        
        mid = (low + high) // 2
        mid_account = sorted_accounts[mid]
        
        if mid_account.account_number == target:
            return mid_account
        elif mid_account.account_number < target:
            return self._recursive_binary_search(sorted_accounts, target, mid + 1, high)
        else:
            return self._recursive_binary_search(sorted_accounts, target, low, mid - 1)

    def find_by_number(self, account_number):
        sorted_accounts = sorted(self._accounts_list, key=lambda a: a.account_number)
        return self._recursive_binary_search(sorted_accounts, account_number, 0, len(sorted_accounts) - 1)

    def _recursive_sum_history(self, history_stack):
        if not history_stack:
            return 0
        
        amount = history_stack[0][1]
        return amount + self._recursive_sum_history(history_stack[1:])

    def total_transactions(self, account_number):
        account = self.find_by_number(account_number)
        if not account:
            return 0
        return self._recursive_sum_history(account.history)


if __name__ == "__main__":
    BankConfig().savings_rate = 0.07   
    BankConfig().overdraft_limit = 2000  

    registry = AccountRegistry()

    tamene_acc = AccountFactory.create("savings", "Tamene", "10003020", balance=1000)
    abebe_acc = AccountFactory.create("current", "Abebe", "10003021", balance=500)
    aster_acc = AccountFactory.create("savings", "Aster", "10003019", balance=3500)

    registry.add(tamene_acc)
    registry.add(abebe_acc)
    registry.add(aster_acc)

    sms_service = SMSAlert("+251-911-000000")
    audit_service = AuditLog()

    tamene_acc.subscribe(sms_service)
    abebe_acc.subscribe(audit_service)

    tamene_acc.deposit(500)
    tamene_acc.deposit(200)
    tamene_acc.withdraw(100)

    abebe_acc.deposit(1000)
    abebe_acc.withdraw(200)

    for acc in registry.top_by_balance(2):
        acc.statement()

    
    found_account = registry.find_by_number("10003020")
    if found_account:
        print("Found matching account:")
        found_account.statement()


    tamene_total = registry.total_transactions("10003020")
    print(f"Tamene (10003020) total transaction volume: {tamene_total} ETB")