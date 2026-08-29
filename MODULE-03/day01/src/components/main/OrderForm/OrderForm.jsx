import { useState } from "react";
import "./OrderForm.css";

function OrderForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    area: "",
  });

  console.log("OrderForm state:", form);

  const isPhoneValid = /^[0-9]{9}$/.test(form.phone);

  function handleChange(event) {
    const { name: field, value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log("Submitting order:", form);
  }

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <h2>Delivery Details</h2>

      <label>
        Name
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
        />
      </label>

      <label>
        TeleBirr Number
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="09xxxxxxxx"
        />
        {form.phone && !isPhoneValid && (
          <span className="form-error">
            TeleBirr number must be 9 digits
          </span>
        )}
      </label>

      <label>
        Area
        <input
          type="text"
          name="area"
          value={form.area}
          onChange={handleChange}
          placeholder="e.g. Bole"
        />
      </label>

      <button type="submit" disabled={!isPhoneValid}>
        Place Order
      </button>
    </form>
  );
}

export default OrderForm;
