

total_spend = {}
try:
    with open("transactions.txt", "r") as file:
        transactions = file.readlines()

    for line in transactions:
        if line.strip(): 
            name, amount = line.strip().split(",")
            amount = float(amount)
            if name in total_spend:
                total_spend[name] += amount
            else:
                total_spend[name] = amount

except FileNotFoundError:
    print("transactions.txt not found.")


for name, total in sorted(total_spend.items(), key=lambda x: x[1], reverse=True):
    print(f"{name}: {total}")


if total_spend:
    with open("report.txt", "w") as file:
        for name, total in sorted(total_spend.items(), key=lambda x: x[1], reverse=True):
            file.write(f"{name}: {total}\n")