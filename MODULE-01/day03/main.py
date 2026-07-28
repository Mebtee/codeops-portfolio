# Goal
# Read a file of TeleBirr transactions, summarise them by customer using a dictionary,
# and handle a missing file gracefully.

# Steps
# 1. Read transactions.txt line by line (name,amount per line).

try:
    with open("transactions.txt", "r") as file:
        transactions = file.readlines()

# 2. Build a dict mapping each customer to their total spend.
        total_spend = {}
        for line in transactions:
            name, amount = line.strip().split(",")
            amount = float(amount)
            if name in total_spend:
                total_spend[name] += amount
            else:
                total_spend[name] = amount
except FileNotFoundError:
    print("Error: transactions.txt not found.")

# 3. Print each customer and total, sorted highest first.
for name, total in sorted(total_spend.items(), key=lambda x: x[1], reverse=True):
    print(f"{name}: {total}")

# 4. Wrap the file read in try / except for a missing file.
# its done

# 5. Write the summary to report.txt, then push to GitHub.
with open("report.txt", "w") as file:
    for name, total in sorted(total_spend.items(), key=lambda x: x[1], reverse=True):
        file.write(f"{name}: {total}\n")