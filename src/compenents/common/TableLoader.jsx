
function TableLoader({
    colSpan = 7,
}) {
    return (
        <tbody>
            <tr>
                <td colSpan={colSpan}>
                    <div className="table-empty-state">
                        <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem', borderWidth: '0.2em' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p style={{ marginTop: '10px' }}>Fetching records...</p>
                    </div>
                </td>
            </tr>
        </tbody>
    );
}
export default TableLoader;