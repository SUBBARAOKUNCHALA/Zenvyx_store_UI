const StatusBadge = ({ status }) => {

    const statusClass = {
        "Open": "status-open",
        "Pending": "status-pending",
        "Waiting for Customer": "status-waiting",
        "In Progress": "status-progress",
        "Resolved": "status-resolved",
        "Closed": "status-closed"
    };

    return (

        <span className={`status-badge ${statusClass[status] || ""}`}>
            {status}
        </span>

    );

};

export default StatusBadge;