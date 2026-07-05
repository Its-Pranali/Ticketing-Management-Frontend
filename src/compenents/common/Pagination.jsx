import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

function Pagination({ pagination, page, setPage }) {
    if (!pagination || !pagination.last_page || pagination.total === 0) {
        return null;
    }

    const getVisiblePages = () => {
        const total = pagination.last_page;
        const current = pagination.current_page || page;
        const visibleCount = 5;

        let start = Math.max(current - 2, 1);
        let end = start + visibleCount - 1;

        if (end > total) {
            end = total;
            start = Math.max(end - visibleCount + 1, 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const startEntry = (pagination.current_page - 1) * pagination.per_page + 1;
    const endEntry = Math.min(pagination.current_page * pagination.per_page, pagination.total);

    return (
        <div className="custom-pagination-container">
            <div className="pagination-info">
                Showing <span className="highlight">{startEntry}</span> to <span className="highlight">{endEntry}</span> of <span className="highlight">{pagination.total}</span> entries
            </div>

            <div className="pagination-controls">
                <button 
                    type="button"
                    className="pagination-arrow-btn" 
                    onClick={() => setPage(1)} 
                    disabled={page === 1}
                    title="First Page"
                >
                    <ChevronsLeft size={16} />
                </button>

                <button 
                    type="button"
                    className="pagination-arrow-btn" 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1}
                    title="Previous Page"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="pagination-numbers">
                    {getVisiblePages().map((p) => (
                        <button
                            key={p}
                            type="button"
                            className={`pagination-number-btn ${page === p ? "active" : ""}`}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <button 
                    type="button"
                    className="pagination-arrow-btn" 
                    onClick={() => setPage(page + 1)} 
                    disabled={page === pagination.last_page}
                    title="Next Page"
                >
                    <ChevronRight size={16} />
                </button>

                <button 
                    type="button"
                    className="pagination-arrow-btn" 
                    onClick={() => setPage(pagination.last_page)} 
                    disabled={page === pagination.last_page}
                    title="Last Page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}

export default Pagination;
