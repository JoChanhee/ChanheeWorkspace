# Mermaid Diagrams 📊

Thanks to the power of `mermaid.js`, you can natively render beautiful diagrams right inside your markdown documents.

## Flowchart

A simple flowchart detailing a standard login sequence.

```mermaid
graph TD
    A[User] -->|Enters Credentials| B(Login Page)
    B --> C{Process}
    C -->|Valid| D[Dashboard]
    C -->|Invalid| E[Error Message]
    E --> B
```

## Sequence Diagram

A sequence diagram showing authentication.

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as Database
    
    U->>C: Enter Login info
    C->>S: POST /api/login
    S->>DB: Query User
    DB-->>S: Return User Data
    alt Valid Credentials
        S-->>C: Return 200 OK & JWT
        C-->>U: Redirect to Dashboard
    else Invalid Credentials
        S-->>C: Return 401 Unauthorized
        C-->>U: Show Error
    end
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
```

## Styling Notes

The charts automatically inherit the base neumorphic colors as configured in `app.js` using Mermaid's theme variables. 
