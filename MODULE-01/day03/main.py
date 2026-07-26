# Goal
# Read a file of TeleBirr transactions, summarise them by customer using a dictionary,
# and handle a missing file gracefully.

# Steps
# 1. Read transactions.txt line by line (name,amount per line).

def read_transactions(filename):

    transaction_dic = {}

    try:
        with open(filename, "r") as file:

            for line in file:
                name, total_spend = line.strip().split(",")

                total_spend = float(total_spend)

                # Step 2:
                # Add spending to existing customer
                if name in transaction_dic:
                    transaction_dic[name] += total_spend
                else:
                    transaction_dic[name] = total_spend

    except FileNotFoundError:
        print("File not found.")
        return {}

    return transaction_dic



# Step 3:
# Sort customers from highest spending to lowest
def sort_transactions(transaction_dic):

    sorted_transactions = sorted(
        transaction_dic.items(), #ስሙንም እና ዋጋውን አብሮ ይመልሳል
        key=lambda item: item[1],# Sort by spending price
        reverse=True
    )

    return sorted_transactions



# Step 5:
# Create report file
def write_report(sorted_transactions, filename):

    with open(filename, "w") as file:

        file.write("Customer Spending Summary\n")
        file.write("-------------------------\n")

        total_sales = 0

        file.write(f"Total Customers: {len(sorted_transactions)}\n\n\n")

        for customer, amount in sorted_transactions:

            file.write(f"{customer}: {amount}\n")
            total_sales += amount
            file.write("\n")
        file.write(f"Total Sales: {total_sales}\n")
        
        
        
# Main Program for run

transactions = read_transactions("transaction.txt")


if transactions:

    sorted_data = sort_transactions(transactions)


    print("Customer Spending Summary")
    print("-------------------------")

    for customer, amount in sorted_data:
        print(f"{customer}: {amount}")


    write_report(sorted_data, "report.txt")


    print("\nReport created successfully.")

else:
    print("No transaction data available.")