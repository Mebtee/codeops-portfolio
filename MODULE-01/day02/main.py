total_bill = 5000
people = 5

def split_bill(total, tip_rate=0.1):
    total_plus_tip = total + (total * tip_rate)
    per_person = total_plus_tip / people
    return per_person

mens = ["tame", "messi", "cr7", "charli", "ronaldo"]

for name in mens:
    print(f"{name} Share bill is {split_bill(total_bill) } Birr  ")