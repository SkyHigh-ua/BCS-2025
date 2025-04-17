import { Pool } from "pg";
import logger from "../utils/logger";
import { User, Role, Group } from "../models/RbacModels";

export class UserRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.pool.on("connect", () => {
      logger.debug("[DB] Database connected successfully");
    });

    this.pool.on("error", (error) => {
      logger.error("Unexpected error on idle database client:", error);
    });
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    try {
      await this.pool.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
        [userId, roleId]
      );
    } catch (error) {
      console.error(
        `Error assigning role (${roleId}) to user (${userId}):`,
        error
      );
      throw new Error("Database error");
    }
  }

  async assignGroupToUser(userId: number, groupId: number): Promise<void> {
    try {
      await this.pool.query(
        "INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)",
        [userId, groupId]
      );
    } catch (error) {
      console.error(
        `Error assigning group (${groupId}) to user (${userId}):`,
        error
      );
      throw new Error("Database error");
    }
  }

  async createGroup(name: string, description: string): Promise<Group> {
    try {
      const result = await this.pool.query(
        "INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING *",
        [name, description]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating group:", error);
      throw new Error("Database error");
    }
  }

  async getAllGroups(): Promise<Group[]> {
    try {
      const result = await this.pool.query("SELECT * FROM groups");
      return result.rows;
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw new Error("Database error");
    }
  }

  async getGroupById(id: number): Promise<Group | null> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM groups WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching group by ID (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async updateGroup(
    id: number,
    updates: Partial<Group>
  ): Promise<Group | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updates);
      const result = await this.pool.query(
        `UPDATE groups SET ${fields} WHERE id = $${
          values.length + 1
        } RETURNING *`,
        [...values, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating group (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async deleteGroup(id: number): Promise<void> {
    try {
      await this.pool.query("DELETE FROM groups WHERE id = $1", [id]);
    } catch (error) {
      console.error(`Error deleting group (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async createRole(name: string, description: string): Promise<Role> {
    try {
      const result = await this.pool.query(
        "INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *",
        [name, description]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating role:", error);
      throw new Error("Database error");
    }
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      const result = await this.pool.query("SELECT * FROM roles");
      return result.rows;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Database error");
    }
  }

  async getRoleById(id: number): Promise<Role | null> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM roles WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching role by ID (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async updateRole(id: number, updates: Partial<Role>): Promise<Role | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
      const values = Object.values(updates);
      const result = await this.pool.query(
        `UPDATE roles SET ${fields} WHERE id = $${
          values.length + 1
        } RETURNING *`,
        [...values, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating role (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async deleteRole(id: number): Promise<void> {
    try {
      await this.pool.query("DELETE FROM roles WHERE id = $1", [id]);
    } catch (error) {
      console.error(`Error deleting role (${id}):`, error);
      throw new Error("Database error");
    }
  }

  async assignRoleToGroup(groupId: number, roleId: number): Promise<void> {
    try {
      await this.pool.query(
        "INSERT INTO group_roles (group_id, role_id) VALUES ($1, $2)",
        [groupId, roleId]
      );
    } catch (error) {
      console.error(
        `Error assigning role (${roleId}) to group (${groupId}):`,
        error
      );
      throw new Error("Database error");
    }
  }

  async getRolesForUser(userId: number): Promise<any[]> {
    try {
      const result = await this.pool.query(
        "SELECT roles.* FROM roles " +
          "JOIN user_roles ON roles.id = user_roles.role_id " +
          "WHERE user_roles.user_id = $1",
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error(`Error fetching roles for user (${userId}):`, error);
      throw new Error("Database error");
    }
  }

  async getRolesForGroup(groupId: number): Promise<any[]> {
    try {
      const result = await this.pool.query(
        "SELECT roles.* FROM roles " +
          "JOIN group_roles ON roles.id = group_roles.role_id " +
          "WHERE group_roles.group_id = $1",
        [groupId]
      );
      return result.rows;
    } catch (error) {
      console.error(`Error fetching roles for group (${groupId}):`, error);
      throw new Error("Database error");
    }
  }

  async getRolesForSite(siteId: number): Promise<any[]> {
    try {
      const result = await this.pool.query(
        "SELECT roles.* FROM roles " +
          "JOIN group_roles ON roles.id = group_roles.role_id " +
          "JOIN group_sites ON group_roles.group_id = group_sites.group_id " +
          "WHERE group_sites.site_id = $1",
        [siteId]
      );
      return result.rows;
    } catch (error) {
      console.error(`Error fetching roles for site (${siteId}):`, error);
      throw new Error("Database error");
    }
  }
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
