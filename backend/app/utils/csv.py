import csv
import io
from typing import Any, Dict, List, Sequence


def generate_csv_stream(headers: Sequence[str], rows: Sequence[Sequence[Any]]) -> str:
    """
    Generate RFC 4180 compliant CSV text from headers and rows with safe escaping.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(headers)
    for row in rows:
        # Convert any None values to empty strings and ensure proper string representation
        sanitized_row = ["" if item is None else str(item) for item in row]
        writer.writerow(sanitized_row)
    return output.getvalue()
