
# Goal
# Refactor the Day 5 account family with SOLID, then add an AccountFactory and an
# Observer alert to the project.

# Steps
# 1. Copy day05/accounts.py into day06/ to keep growing it.
# 2. Split alerts out of Account into a separate AlertService (SRP).
# 3. Add an AccountFactory.create(kind, ...) for the two types.
# 4. Add subscribe/_notify to Account; write an SMSAlert observer.
# 5. Open accounts via the factory, attach the alert, push to day06.


class Alert:
    def update(self, message):
        print(f"SMS Alert Sent: {message}")


class Account:
    def __init__(self, owner, number, balance=0):
        self.owner = owner
        self.account_number = number
        self.__balance = balance
        self.alerts = []

    @property
    def balance(self):
        return self.__balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.__balance += amount

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Entered Amount must be positive")

        if amount > self.__balance:
            raise ValueError("Insufficient funds for this withdrawal")

        self.__balance -= amount

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


account1 = AccountFactory.create("saving", "Tamene", 10003020, 1000, 0.05)
account2 = AccountFactory.create("checking", "Abebe", 10003021, 2000, overdraft_limit=50)

alert_service = Alert()
account1.attach(alert_service)  

account1.statement()
account1.add_interest() 