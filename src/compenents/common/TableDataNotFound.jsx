import { AlertCircle } from "lucide-react";

function TableDataNotFound({
    title = "Data",
    colSpan = 5,
    message,
}) {
    return (
        <tbody>
            <tr>
                <td colSpan={colSpan}>
                    <div className="table-empty-state">
                        <AlertCircle
                            className="empty-state-icon"
                            size={32}
                        />

                        <h4>No {title} Found</h4>

                        <p>
                            {message ||
                                `Try refining your search query or add a new ${title.toLowerCase()}.`}
                        </p>
                    </div>
                </td>
            </tr>
        </tbody>
    );
}

export default TableDataNotFound;