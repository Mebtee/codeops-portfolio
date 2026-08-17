# In-Class Exercise — Sort & Search the Registry

# Goal
# Add a balance leaderboard, a binary search by account number, and a recursive
# total to the AccountRegistry.

# Steps
# 1. Copy day07/registry.py into day08/ to keep growing it.
# 2. Add top_by_balance(n) using sorted with a key=lambda.
# 3. Write your own binary_search; add find_by_number().
# 4. Add recursive total_transactions() for one account.
# 5. Test all three on sample data; push to day08.


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

    def top_by_balance(self, n):
        all_accounts = list(self._accounts.values())
        sorted_by_bal = sorted(all_accounts, key=lambda acc: acc.balance, reverse=True)
        return sorted_by_bal[:n]

    def find_by_number(self, target_number):
        sorted_accounts = sorted(self._accounts.values(), key=lambda acc: acc.account_number)
        
        low = 0
        high = len(sorted_accounts) - 1

        while low <= high:
            mid = (low + high) // 2
            current_acc = sorted_accounts[mid]

            if current_acc.account_number == target_number:
                return current_acc
            elif current_acc.account_number < target_number:
                low = mid + 1
            else:
                high = mid - 1
                
        return None

    @staticmethod
    def total_transactions(account):
        def _count_recursive(history_slice):
            if not history_slice:
                return 0
            return 1 + _count_recursive(history_slice[1:])

        return _count_recursive(account.history)


account1 = AccountFactory.create("saving", "Tamene", 10003020, 1500, 0.05)
account2 = AccountFactory.create("checking", "Abebe", 10003021, 2000, overdraft_limit=50)
account3 = AccountFactory.create("saving", "Aster", 10003019, 4500)

registry = AccountRegistry()
registry.add(account1)
registry.add(account2)
registry.add(account3)

top_accounts = registry.top_by_balance(2)


for acc in top_accounts:
    print(f"- Owner: {acc.owner}, Balance: {acc.balance} ETB")

found_acc = registry.find_by_number(10003020)
if found_acc:
    print(f"Binary Search found: {found_acc.owner} with account #{found_acc.account_number}")
else:
    print("Account not found.")

account1.deposit(300)
account1.withdraw(100)
account1.deposit(50)

tx_count = AccountRegistry.total_transactions(account1)
print(f"Total transactions for account {account1.account_number} (recursively counted): {tx_count}")




