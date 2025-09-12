// Auth configuration fix
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || 'xK9mP2nQ8rT5vW3yZ6aB4cD7eF1gH0jL2024princip',
  url: process.env.NEXTAUTH_URL || 'https://princip-gym-app.vercel.app'
};