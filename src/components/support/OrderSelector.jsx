import { useEffect, useState } from "react";
import { Package, CalendarDays } from "lucide-react";
import "./OrderSelector.css";

import { getMyOrdersApi } from "../../services/authService";

const OrderSelector = ({ value, onChange }) => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        fetchOrders();

    }, []);

    const fetchOrders = async () => {

        try {

            setLoading(true);

            const res = await getMyOrdersApi();

            setOrders(res?.data?.data || []);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };

    const selectedOrder = orders.find(
        (order) => order._id === value
    );

    return (

        <div className="order-selector">

            <label>

                Related Order

            </label>

            <select
                name="order"
                value={value}
                onChange={onChange}
            >

                <option value="">

                    Select an Order (Optional)

                </option>

                {

                    orders.map((order) => (

                        <option
                            key={order._id}
                            value={order._id}
                        >

                            #{order.orderNumber || order._id} • {order.items?.[0]?.name || "Order"}

                        </option>

                    ))

                }

            </select>

            {

                loading && (

                    <p className="loading-order">

                        Loading Orders...

                    </p>

                )

            }

            {
                selectedOrder && (

                    <div className="selected-order-card">

                        <img
                            src={selectedOrder.items?.[0]?.image}
                            alt={selectedOrder.items?.[0]?.name}
                            className="selected-order-image"
                        />

                        <div className="selected-order-content">

                            <h4>

                                {selectedOrder.items?.[0]?.name}

                            </h4>

                            <p>

                                <Package size={15} />

                                <span>

                                    {selectedOrder.orderNumber}

                                </span>

                            </p>

                            <small>

                                <CalendarDays size={14} />

                                Ordered on{" "}

                                {new Date(selectedOrder.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric"
                                    }
                                )}

                            </small>

                            <div className="order-badges">

                                <span className={`status ${selectedOrder.orderStatus.toLowerCase()}`}>

                                    {selectedOrder.orderStatus}

                                </span>

                                <span className={`payment ${selectedOrder.paymentStatus.toLowerCase()}`}>

                                    {selectedOrder.paymentStatus}

                                </span>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

};

export default OrderSelector;