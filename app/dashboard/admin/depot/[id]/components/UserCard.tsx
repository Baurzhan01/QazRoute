"use client";

import type { User } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Eye, UserPlus, Trash2 } from "lucide-react";
import { getRoleCardGradient } from "../utils/roleUtils";

interface UserCardProps {
  title: React.ReactNode;
  role: User["role"];
  users: User[];
  onEdit: (user: User) => void;
  onViewAll: (role: string) => void;
  onAddUser: () => void;
  onDelete: (userId: string) => void;
}

export default function UserCard({ title, role, users, onEdit, onViewAll, onAddUser, onDelete }: UserCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className={`bg-gradient-to-r ${getRoleCardGradient(role)} text-white`}>
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
        <CardDescription
          className={
            role === "fleetManager"
              ? "text-sky-100"
              : role === "seniorDispatcher"
                ? "text-amber-100"
                : role === "dispatcher"
                  ? "text-green-100"
                  : role === "mechanic"
                    ? "text-purple-100"
                    : role === "hr"
                      ? "text-rose-100"
                      : "text-blue-100"
          }
        >
          {users.length} пользователей
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {users.length > 0 ? (
            users.slice(0, 1).map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback>{user.fullName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.position || "Нет должности"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">Нет пользователей с этой ролью</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        {users.length > 1 && (
          <Button variant="ghost" size="sm" onClick={() => onViewAll(role)}>
            <Eye className="mr-2 h-4 w-4" />
            Просмотреть всех ({users.length})
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </CardFooter>
    </Card>
  );
}