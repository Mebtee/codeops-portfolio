# In-Class Exercise — The Account Registry

# Goal
# Build an AccountRegistry that stores many accounts in a dict for O(1) lookup, and
# gives each account a transaction-history stack.

# Steps
# 1. Copy day06/bank.py into day07/ to keep growing it.
# 2. Add an AccountRegistry storing accounts in a dict by number.
# 3. Implement add(), find() — O(1) — and an ordered list_all().
# 4. Give each account a history stack; push on deposit/withdraw.
# 5. Add undo_last() that pops the most recent transaction; push to day07.


class Alert:
    def update(self, message):
        print(f"SMS Alert Sent: {message}")


class Account:
    def __init__(self, owner, number, balance=0):
        self.owner = owner
        self.account_number = number
        self.__balance = balance
        self.alerts = []
        self.history = []

    @property
    def balance(self):
        return self.__balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.__balance += amount
        self.history.append(("deposit", amount))
        self._notify(f"Deposited {amount} ETB")

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Entered Amount must be positive")

        if amount > self.__balance:
            raise ValueError("Insufficient funds for this withdrawal")

        self.__balance -= amount
        self.history.append(("withdraw", amount))
        self._notify(f"Withdrew {amount} ETB")

    def undo_last(self):
        if not self.history:
            print(f"No transactions to undo for account {self.account_number}.")
            return
        
        action, amount = self.history.pop()
        
        if action == "deposit":
            self.__balance -= amount
            print(f"Undid deposit of {amount} ETB.")
        elif action == "withdraw":
            self.__balance += amount
            print(f"Undid withdrawal of {amount} ETB.")

    def alert(self):
        print(f"Owner: {self.owner} | Account: {self.account_number} | Balance: {self.balance} ETB")

    def attach(self, alert_observer):
        self.alerts.append(alert_observer)

    def _notify(self, message):
        for alert_observer in self.alerts:
            alert_observer.update(message)


class SavingAccount(Account):
    def __init__(self, owner, number, balance=0, rate=0.05):
        super().__init__(owner, number, balance)
        self.rate = rate

    def add_interest(self):
        interest = self.balance * self.rate
        self.deposit(interest)
        print(f"Added {interest} ETB interest.")

    def statement(self):
        print(f"Type: Saving | Owner: {self.owner} | Account: {self.account_number} | Balance: {self.balance} ETB | interest_rate: {self.rate}")


class CheckingAccount(Account):
    def __init__(self, owner, number, balance=0, overdraft_limit=10000):
        super().__init__(owner, number, balance)
        self.overdraft_limit = overdraft_limit

    def statement(self):
        return f"Type: Checking | Owner: {self.owner} | Account: {self.account_number} | Balance: {self.balance} ETB | overdraft_limit: {self.overdraft_limit}"

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Entered negative or zero number")

        if amount > (self.balance + self.overdraft_limit):
            raise ValueError("Exceeded overdraft limit")

        self._Account__balance -= amount
        self.history.append(("withdraw", amount))
        self._notify(self.statement())


class AccountFactory:
    @staticmethod
    def create(kind, owner, number, balance=0, rate=0.05, overdraft_limit=1000):
        if kind == "saving":
            return SavingAccount(owner, number, balance, rate)
        elif kind == "checking":
            return CheckingAccount(owner, number, balance, overdraft_limit)
        else:
            raise ValueError("Enter Valid Kind's")


class AccountRegistry:
    def __init__(self):
        self._accounts = {}

    def add(self, account):
        self._accounts[account.account_number] = account
        print(f"Account {account.account_number} added to registry.")

    def find(self, account_number):
        return self._accounts.get(account_number)

    def list_all(self):
        sorted_accounts = [self._accounts[acc_num] for acc_num in sorted(self._accounts.keys())]
        for acc in sorted_accounts:
            if hasattr(acc, 'statement'):
                if isinstance(acc, SavingAccount):
                    acc.statement()
                else:
                    print(acc.statement())
            else:
                acc.alert()
        return sorted_accounts



account1 = AccountFactory.create("saving", "Tamene", 10003020, 1000, 0.05)
account2 = AccountFactory.create("checking", "Abebe", 10003021, 2000, overdraft_limit=50)
account3 = AccountFactory.create("saving", "Aster", 10003019, 500)

registry = AccountRegistry()
registry.add(account1)
registry.add(account2)
registry.add(account3)

registry.list_all()

found = registry.find(10003020)
print(f"Found: {found.owner}")

alert_service = Alert()
account1.attach(alert_service)  

account1.deposit(200) 
account1.withdraw(500)  
account1.statement()

account1.undo_last()
account1.statement()

account1.undo_last()
account1.statement()