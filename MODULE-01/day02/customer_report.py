customers= [("Alice", 400), ("Bob", 800), ("Charlie", 1200), ("ABEBE", 1800), ("HELEN", 2400)]

def tier(balance):
    if balance>= 1000:
        return "Premium"
    elif balance>= 500:
        return "Standard"
    else:
        return "Basic"

for name, balance in customers:
    print(f"{name} has a balance of {balance}ETB and is a {tier(balance)} customer.")

premium_count = 0
standard_count = 0
basic_count = 0

for name, balance in customers:
    customer_tier = tier(balance)
    if customer_tier == "Premium":
        premium_count += 1
    elif customer_tier == "Standard":
        standard_count += 1
    else:
        basic_count += 1

print(f"Number of Premium customers: {premium_count}")
print(f"Number of Standard customers: {standard_count}")
print(f"Number of Basic customers: {basic_count}")