
CREATE TABLE user_invite_link (
    id SERIAL PRIMARY KEY,
    inviter VARCHAR(255) NOT NULL DEFAULT '0',
    inviter_code VARCHAR(255) NOT NULL DEFAULT '',
    integral INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_inviter ON user_invite_link (inviter);

CREATE TABLE user_invite_link_records (
    id SERIAL PRIMARY KEY,
    inviter VARCHAR(255) NOT NULL DEFAULT '',
    invitee VARCHAR(255) NOT NULL DEFAULT '',
    inviter_code VARCHAR(255) NOT NULL,
    ip VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX inviter_ip ON user_invite_link_records (inviter, ip);
