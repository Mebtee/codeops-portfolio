#1. Unique cities. Given a list with repeated city names, use a set to print the distinct cities, then 
# the count.
cities = ['Addis Ababa', 'jimma', 'Bahir Dar', 'Gondar', 'paris', 'Dire Dawa', 'Adama', 'ilibabour', 'Adama', 'Dire Dawa', 'paris']
print(f"Number of cities in lists: {len(cities)}")

unique_cities = set(cities)
print(f"Number of unique cities in lists: {len(unique_cities)}")

#Price report. Make a dictionary of five grocery items and prices in ETB. Loop with .items() to 
# print each on its own line.

grocery_items = {
    'injera': 25,
    'teff': 185,
    'soya': 70,
    'egg': 20,
    'fish': 205
}


for item, price in grocery_items.items():
    print(f"{item}: {price:} ETB")
    
#practice 3 Tax comprehension. Given prices = [100, 250, 400, 80], use one comprehension to build
#a list with 15% tax added

prices = [100, 250, 400, 80]
taxed_prices = [price * 1.15 for price in prices]
print(f"Taxed prices: {taxed_prices[0]:.2f}, {taxed_prices[1]:.2f}, {taxed_prices[2]:.2f}, {taxed_prices[3]:.2f}")

#practice 4 Cheap items. From the same list, use a comprehension with a condition to keep only prices
#under 200

cheap_items = [price for price in prices if price < 200]
print(cheap_items)

#practice 5 Write & read. Write three customer names to names.txt, then open it and print each name
#back, one per line

with open('name.txt', 'w') as f:
    f.write("tame beh\n")
    f.write("messi barcia\n")
    f.write("charli chapi\n")


with open("name.txt", "r") as f:
    for line in f:
        print(line.strip())

#practice 6 Safe division. Ask the user for a number and divide 1000 by it, catching both ValueError and
#ZeroDivisionError

try:
    number = int(input("enter a number_divisible by 1000: "))
    result = 1000 / number
except ValueError:
    print("Invalid input. Please enter a valid number.")
except ZeroDivisionError:
    print("Error: Division by zero is not allowed.")
else:
    print(f"Result: {result}")
finally:
    print("Execution completed.")
    
    
    
