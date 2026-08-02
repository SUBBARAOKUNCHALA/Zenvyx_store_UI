const PriorityBadge = ({ priority }) => {

    const priorityClass = {
        Low: "priority-low",
        Medium: "priority-medium",
        High: "priority-high",
        Critical: "priority-critical"
    };

    return (

        <span className={`priority-badge ${priorityClass[priority] || ""}`}>
            {priority}
        </span>

    );

};

export default PriorityBadge;