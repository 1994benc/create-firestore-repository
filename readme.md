# Create Firestore Repository
## What is it?
Running `npx create-firestore-repository entity` will create a new directory for your entity, with functions to accesss data from collection "entity" inside your firestore database.

## How to use it?
1. Initialize your firebase app
2. Move into a directory that you want to contain your data repository functions
3. Run `npx create-firestore-repository entity` where entity is the name of your entity. For example, if you want to create a repository for a user and your collection path is `users`, you can run `npx create-firestore-repository user` and it will create a directory called `user` and the following files:
    - `useUsers.ts`
    - `useUser.ts`
    - `setUser.ts`
    - `deleteUser.ts`
4. Import repository functions into your app and use them.
```
import useUsers from './useUsers'

export default function App() {
  const data = useUsers()
  return (
    <div>
      {data.map(user => (
        <div key={user.id}>
          {user.name}
        </div>
      ))}
    </div>
  )
}
```
## Notes:
- the entity name must be singular. For example, "user" not "users".
- the entity name must be lowercase. For example, "User" not "user".
- you can separate syllables with a dash. For example, "user-profile". This will use the collection path "user-profiles" and create an entity called "UserProfile".
- Nested paths are not supported. For example, "user/profile" will not work. However, we are planning to support nested paths in the future.