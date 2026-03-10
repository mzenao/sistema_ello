from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db, ma


class User(db.Model):
    """Modelo de Usuário com Autenticação Segura"""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='user')  # user, dentist, admin
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    tokens = db.relationship('AuthToken', backref='user', cascade='all, delete-orphan')
    
    def set_password(self, password: str):
        """Criptografa e armazena a senha"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password: str) -> bool:
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.email}>'


class AuthToken(db.Model):
    """Modelo para Tokens de Autenticação"""
    
    __tablename__ = 'auth_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def is_valid(self) -> bool:
        """Verifica se o token ainda é válido"""
        return datetime.utcnow() < self.expires_at
    
    def __repr__(self):
        return f'<AuthToken user_id={self.user_id}>'


class UserSchema(ma.SQLAlchemyAutoSchema):
    """Schema para serialização de Usuário (sem password)"""
    
    class Meta:
        model = User
        load_instance = True
        include_fk = True
        exclude = ['password_hash']


# Schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
