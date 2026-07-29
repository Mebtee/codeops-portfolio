from collections import deque

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


# --- Step 2 & 3: Branch Tree & Recursive Total Balance ---
class Branch:
    def __init__(self, name, accounts=None, sub_branches=None):
        self.name = name
        self.accounts = accounts if accounts else []
        self.sub_branches = sub_branches if sub_branches else []

    @staticmethod
    def recursive_total_balance(branch):
        """Recursively calculates the total balance of a branch and all its nested sub-branches."""
        # Sum balances of accounts directly in this branch
        local_balance = sum(acc.balance for acc in branch.accounts)
        
        # Base case / recursive step: sum balances of sub-branches
        sub_balance = sum(Branch.recursive_total_balance(sub) for sub in branch.sub_branches)
        
        return local_balance + sub_balance


# --- Step 4: Transfers Graph & BFS Traversal ---
class BankNetwork:
    def __init__(self):
        # Adjacency list representing transfer routing paths between branches/nodes
        self.graph = {}

    def add_route(self, node_from, node_to):
        if node_from not in self.graph:
            self.graph[node_from] = []
        self.graph[node_from].append(node_to)

    def bfs(self, start_node):
        """Performs a Breadth-First Search to find all nodes reachable from the start node."""
        visited = set()
        queue = deque([start_node])
        visited.add(start_node)
        reachable = []

        while queue:
            current = queue.popleft()
            reachable.append(current)

            for neighbor in self.graph.get(current, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
                    
        return reachable


# --- Testing the Implementation ---
print("--- Creating Sample Accounts ---")
acc1 = AccountFactory.create("saving", "Tamene", 10003020, 1500, 0.05)
acc2 = AccountFactory.create("checking", "Abebe", 10003021, 2500, overdraft_limit=50)
acc3 = AccountFactory.create("saving", "Aster", 10003019, 4000)
acc4 = AccountFactory.create("saving", "Kebede", 10003022, 1000)

print("\n--- Testing Branch Hierarchy & Recursive Totals ---")
# Build a tree structure: Head Office -> Regions -> Branches
bole_branch = Branch("Bole Branch", accounts=[acc1])
piassa_branch = Branch("Piassa Branch", accounts=[acc2])
addis_ababa_region = Branch("Addis Ababa Region", sub_branches=[bole_branch, piassa_branch])

hawassa_branch = Branch("Hawassa Branch", accounts=[acc3, acc4])
snnp_region = Branch("SNNP Region", sub_branches=[hawassa_branch])

head_office = Branch("Head Office", sub_branches=[addis_ababa_region, snnp_region])

total_bank_balance = Branch.recursive_total_balance(head_office)
print(f"Total Bank Balance (Head Office Hierarchy): {total_bank_balance} ETB")

print("\n--- Testing Transfers Graph & BFS Traversal ---")
network = BankNetwork()
network.add_route("CBE-1", "CBE-Bole")
network.add_route("CBE-1", "CBE-Piassa")
network.add_route("CBE-Bole", "CBE-Hawassa")
network.add_route("CBE-Piassa", "CBE-Adama")
network.add_route("CBE-Adama", "CBE-Dire")

reachable_nodes = network.bfs("CBE-1")
print(f"Nodes reachable from CBE-1 via BFS: {reachable_nodes}")