graph TD
    subgraph "Folder: roboedu-studio (ROOT)"
        style Root fill:#e1f5fe,stroke:#01579b,stroke-width:2px
        
        Root[📂 roboedu-studio]
        
        subgraph "1. Folder Konfigurasi (BARU)"
            style DotClaude fill:#fff9c4,stroke:#fbc02d
            DotClaude[📂 .claude]
            Agents[📂 agents]
            Rules[📂 rules]
            Skills[📂 skills]
            
            DotClaude --> Agents
            DotClaude --> Rules
            DotClaude --> Skills
            
            Note1[Isi folder ini diambil dari<br/>repo 'everything-claude-code'<br/>yang Anda download]
            DotClaude -.-> Note1
        end
        
        subgraph "2. File Utama Proyek (SUDAH ADA)"
            style Src fill:#e0f2f1,stroke:#00695c
            Src[📂 src]
            Git[📂 .git]
            Package[📄 package.json]
            Readme[📄 README.md]
        end
        
        subgraph "3. File Aturan Utama (BARU)"
            style ClaudeMD fill:#ffccbc,stroke:#d84315,stroke-width:2px
            ClaudeMD[📄 CLAUDE.md]
            
            Note2[File yang baru Anda buat<br/>berisi kode di atas]
            ClaudeMD -.-> Note2
        end

        Root --> DotClaude
        Root --> Src
        Root --> Git
        Root --> Package
        Root --> Readme
        Root --> ClaudeMD
    end
