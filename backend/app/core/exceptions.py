from typing import Any, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppException(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Any] = None,
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details
        super().__init__(message)


class BadRequestException(AppException):
    def __init__(self, message: str, code: str = "BAD_REQUEST", details: Optional[Any] = None):
        super().__init__(status.HTTP_400_BAD_REQUEST, code, message, details)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required.", code: str = "UNAUTHORIZED", details: Optional[Any] = None):
        super().__init__(status.HTTP_401_UNAUTHORIZED, code, message, details)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Permission denied.", code: str = "FORBIDDEN", details: Optional[Any] = None):
        super().__init__(status.HTTP_403_FORBIDDEN, code, message, details)


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found.", code: str = "NOT_FOUND", details: Optional[Any] = None):
        super().__init__(status.HTTP_404_NOT_FOUND, code, message, details)


class ConflictException(AppException):
    def __init__(self, message: str, code: str = "CONFLICT", details: Optional[Any] = None):
        super().__init__(status.HTTP_409_CONFLICT, code, message, details)


class UnprocessableEntityException(AppException):
    def __init__(self, message: str, code: str = "UNPROCESSABLE_ENTITY", details: Optional[Any] = None):
        super().__init__(status.HTTP_422_UNPROCESSABLE_ENTITY, code, message, details)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        409: "CONFLICT",
        422: "UNPROCESSABLE_ENTITY",
        500: "INTERNAL_SERVER_ERROR",
    }
    code = code_map.get(exc.status_code, "HTTP_ERROR")
    message = str(exc.detail) if exc.detail else "An HTTP error occurred."
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": None,
            }
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    # Serialize errors safely using jsonable_encoder
    sanitized_errors = []
    for err in exc.errors():
        sanitized_errors.append({
            "loc": [str(x) for x in err.get("loc", [])],
            "msg": str(err.get("msg", "")),
            "type": str(err.get("type", "")),
        })
        
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters or payload.",
                "details": sanitized_errors,
            }
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Do not expose internal stack traces in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred.",
                "details": None,
            }
        },
    )
