"""
Seed de usuários de autenticação com hash real de senha.

Uso:
  python backend/scripts/seed_auth_users.py
"""
import os
import sys

# Adiciona backend/ ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models.users import User


USERS = [
    {
        "email": "admin@odonto.com",
        "name": "Administrador",
        "password": "admin",
        "role": "admin",
        "is_active": True,
    },
]


def upsert_users():
    app = create_app("development")

    with app.app_context():
        created = 0
        updated = 0

        for data in USERS:
            user = User.query.filter_by(email=data["email"]).first()

            if not user:
                user = User(email=data["email"], name=data["name"], role=data["role"], is_active=data["is_active"])
                user.set_password(data["password"])  # gera hash real
                db.session.add(user)
                created += 1
            else:
                user.name = data["name"]
                user.role = data["role"]
                user.is_active = data["is_active"]
                user.set_password(data["password"])  # força atualização do hash
                updated += 1

        db.session.commit()

        print("Usuarios de autenticacao atualizados com sucesso.")
        print(f"Criados: {created} | Atualizados: {updated}")
        print("Credenciais:")
        for data in USERS:
            print(f"- {data['email']} / {data['password']}")


if __name__ == "__main__":
    upsert_users()
