const LoadingSkeleton = () => {

    return (

        <div className="ticket-skeleton-list">

            {

                Array.from({ length: 5 }).map((_, index) => (

                    <div
                        className="ticket-skeleton"
                        key={index}
                    >

                        <div className="skeleton skeleton-id"></div>

                        <div className="skeleton skeleton-title"></div>

                        <div className="skeleton skeleton-text"></div>

                        <div className="skeleton skeleton-text short"></div>

                        <div className="skeleton-footer">

                            <div className="skeleton skeleton-badge"></div>

                            <div className="skeleton skeleton-button"></div>

                        </div>

                    </div>

                ))

            }

        </div>

    );

};

export default LoadingSkeleton;