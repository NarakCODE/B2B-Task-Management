# Role-Based Access Control (RBAC) API Documentation

This document describes the workspace roles and permissions (RBAC) management API endpoints implemented in the application.

---

## 1. Fetch Workspace Roles and Permissions

Retrieves all user roles (`OWNER`, `ADMIN`, `MEMBER`) and their associated permission arrays.

* **URL**: `/api/workspace/roles/:id`
* **Method**: `GET`
* **Headers**: `Content-Type: application/json`
* **Authentication**: Required (Session Cookie)
* **Access Control Check**: Requires the requester to have `Permissions.VIEW_ONLY` in the specified workspace (i.e. must be a workspace member).

### Route Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The ID of the workspace. |

### Response Example (`200 OK`)
```json
{
  "message": "Roles and permissions fetched successfully",
  "roles": [
    {
      "_id": "667104b2b1ef1066804a1122",
      "name": "OWNER",
      "permissions": [
        "CREATE_WORKSPACE",
        "DELETE_WORKSPACE",
        "EDIT_WORKSPACE",
        "MANAGE_WORKSPACE_SETTINGS",
        "ADD_MEMBER",
        "CHANGE_MEMBER_ROLE",
        "REMOVE_MEMBER",
        "CREATE_PROJECT",
        "EDIT_PROJECT",
        "DELETE_PROJECT",
        "CREATE_TASK",
        "EDIT_TASK",
        "DELETE_TASK",
        "VIEW_ONLY"
      ],
      "createdAt": "2026-06-18T03:36:02.475Z",
      "updatedAt": "2026-06-18T03:36:02.475Z"
    },
    {
      "_id": "667104b2b1ef1066804a1123",
      "name": "ADMIN",
      "permissions": [
        "CREATE_WORKSPACE",
        "EDIT_WORKSPACE",
        "MANAGE_WORKSPACE_SETTINGS",
        "ADD_MEMBER",
        "CHANGE_MEMBER_ROLE",
        "CREATE_PROJECT",
        "EDIT_PROJECT",
        "CREATE_TASK",
        "EDIT_TASK",
        "DELETE_TASK",
        "VIEW_ONLY"
      ],
      "createdAt": "2026-06-18T03:36:02.475Z",
      "updatedAt": "2026-06-18T13:09:44.200Z"
    },
    {
      "_id": "667104b2b1ef1066804a1124",
      "name": "MEMBER",
      "permissions": [
        "CREATE_TASK",
        "EDIT_TASK",
        "VIEW_ONLY"
      ],
      "createdAt": "2026-06-18T03:36:02.475Z",
      "updatedAt": "2026-06-18T03:36:02.475Z"
    }
  ]
}
```

---

## 2. Update Role Permissions

Modifies the assigned permissions for a given role within the workspace.

* **URL**: `/api/workspace/:id/role/:roleId/permissions`
* **Method**: `PUT`
* **Headers**: `Content-Type: application/json`
* **Authentication**: Required (Session Cookie)
* **Access Control Check**: Requires the requester to have `Permissions.MANAGE_WORKSPACE_SETTINGS` in the specified workspace (typically the workspace `OWNER` or high-level admins).
* **Safety Rules**: Permissions for the `OWNER` role are system-locked and cannot be modified. Any request targeting the `OWNER` role ID will be rejected.

### Route Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | The ID of the workspace. |
| `roleId` | `string` | The ID of the role to update (e.g. `ADMIN` or `MEMBER` role ID). |

### Request Body
```json
{
  "permissions": [
    "CREATE_TASK",
    "EDIT_TASK",
    "VIEW_ONLY",
    "CREATE_PROJECT",
    "EDIT_PROJECT"
  ]
}
```

### Response Example (`200 OK`)
```json
{
  "message": "Role permissions updated successfully",
  "role": {
    "_id": "667104b2b1ef1066804a1123",
    "name": "ADMIN",
    "permissions": [
      "CREATE_TASK",
      "EDIT_TASK",
      "VIEW_ONLY",
      "CREATE_PROJECT",
      "EDIT_PROJECT"
    ],
    "createdAt": "2026-06-18T03:36:02.475Z",
    "updatedAt": "2026-06-18T13:11:44.800Z"
  }
}
```

### Error Responses
* **`400 Bad Request`**:
  * Attempting to modify the `OWNER` role permissions:
    ```json
    {
      "message": "Permissions for the OWNER role cannot be modified."
    }
    ```
  * Supplying one or more invalid permission keys:
    ```json
    {
      "message": "Invalid permissions: SOMETHING_INVALID"
    }
    ```
* **`403 Forbidden`**:
  * User is not a member of the workspace or does not have `Permissions.MANAGE_WORKSPACE_SETTINGS`:
    ```json
    {
      "message": "You do not have permission to perform this action"
    }
    ```
* **`404 Not Found`**:
  * Role does not exist:
    ```json
    {
      "message": "Role not found"
    }
    ```
