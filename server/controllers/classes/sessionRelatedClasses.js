class Session {
    constructor(id, admin_id, admin) {
        this.id = id;
        this.admin_id = admin_id;
        this.admin = admin;
        this.data = {};
        this.users = [];
        this.blacklist = [];
        this.def_permissions = new Permissions(true, true, true);
    }

    addUser(user, permissions) {
        console.log(this.admin_id == user.id);
        console.log(
            this.users.find((u) => {
                return u.id == user.id;
            })
        );
        if (this.admin_id == user.id) return false;
        if (
            this.users.find((u) => {
                return u.id == user.id;
            })
        )
            return false;

        if (permissions) {
            this.users.push(new SessionUser(user.id, user.username, permissions));
        } else {
            this.users.push(new SessionUser(user.id, user.username, this.def_permissions));
        }
        return true;
    }
}

class Permissions {
    constructor(canEdit, canDelete, canChat) {
        this.canEdit = canEdit;
        this.canDelete = canDelete;
        this.canChat = canChat;
    }
}

class SessionUser {
    constructor(id, username, permissions) {
        this.id = id;
        this.username = username;
        this.permissions = permissions;
    }
}

module.exports = {
    Session,
    SessionUser,
    Permissions,
};
