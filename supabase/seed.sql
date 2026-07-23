insert into public.users (name, email, password_hash, role)
values
  ('Ramseys Admin', 'admin@ramseysdigital.com', '$2a$10$L0FhKX9zK3rm3AU4UjDYIu4IR/1nXk5gW3Hq4C6TTr2Z7zC2M4e3a', 'ADMIN')
on conflict (email) do nothing;

insert into public.posts (title, slug, excerpt, content, published, author_id)
select * from (
  values
    (
      'L''IA dans les PME : 3 usages concrets à mettre en place maintenant',
      'ia-dans-les-pme-3-usages-concrets-a-mettre-en-place-maintenant',
      'Des usages simples, mesurables et immédiatement utiles pour gagner du temps sans compliquer les équipes.',
      '# L''IA dans les PME : 3 usages concrets à mettre en place maintenant\n\nL''intelligence artificielle ne doit pas être un projet futuriste. Dans une PME, elle devient utile dès qu''elle réduit les tâches répétitives et accélère la prise de décision.\n\n## 1. Automatiser les échanges internes\n\nLes demandes de support, les relances clients ou les relances de suivi peuvent être priorisées automatiquement grâce à des outils d''IA qui classent les messages et suggèrent une réponse.\n\n## 2. Structurer les données clients\n\nL''IA aide à nettoyer les fiches clients, à extraire des informations et à créer des synthèses exploitables pour l''équipe commerciale.\n\n## 3. Produire des contenus rapidement\n\nUn assistant peut générer la première version d''un article, d''un mail, d''un plan d''action ou d''un discours interne, puis l''équipe apporte la touche finale.\n\nLe vrai gain ne vient pas de l''outil seul, mais de la discipline de mise en place et de la qualité des données.',
      true,
      (select id from public.users where email = 'admin@ramseysdigital.com')
    ),
    (
      'Apple Intelligence : pourquoi l''écosystème Apple garde un avantage stratégique',
      'apple-intelligence-pourquoi-lecosysteme-apple-garde-un-avantage-strategique',
      'Au-delà du matériel, Apple gagne en cohérence entre capteurs, matériel, sécurité et expérience utilisateur.',
      '# Apple Intelligence : pourquoi l''écosystème Apple garde un avantage stratégique\n\nL''attention portée à l''intégration entre le matériel, le système d''exploitation et l''expérience logicielle reste l''un des plus gros avantages d''Apple.\n\nCela signifie que l''IA ne se contente pas d''être un service additionnel : elle s''intègre dans un environnement où la confidentialité, la performance et la simplicité sont pensées dès le départ.\n\n## Une expérience plus fluide\n\nLes appareils Apple partagent un niveau de cohérence rare. Cela réduit les frictions et permet de mieux exploiter les fonctionnalités sans demander à l''utilisateur de comprendre la pile technique.\n\n## Une vraie différence sur la confiance\n\nQuand l''utilisateur sait que ses données sont mieux protégées et que l''expérience est cohérente entre ses appareils, la facilitation devient un vrai levier de confiance.\n\nC''est cette combinaison entre performance et simplicité qui continue de faire la différence.',
      true,
      (select id from public.users where email = 'admin@ramseysdigital.com')
    ),
    (
      'Tech 2026 : les 5 tendances qui vont redéfinir la productivité',
      'tech-2026-les-5-tendances-qui-vont-redefinir-la-productivite',
      'Des outils de collaboration à l''automation intelligente, la productivité change de paradigme.',
      '# Tech 2026 : les 5 tendances qui vont redéfinir la productivité\n\nLes entreprises ne cherchent plus seulement des outils performants. Elles veulent des solutions qui s''adaptent à leur organisation, limitent les tâches répétitives et améliorent la qualité des décisions.\n\n## 1. L''IA copilote devient standard\n\nLes assistants deviennent des outils de travail quotidiens, capables de rédiger, résumer, comparer ou recommander.\n\n## 2. Les plateformes deviennent plus ouvertes\n\nLa tendance est à l''interopérabilité entre outils, ce qui permet de mieux connecter les équipes et de réduire les silos.\n\n## 3. La sécurité est un facteur de productivité\n\nUn système fiable et bien surveillé permet d''éviter les interruptions coûteuses et les pertes de données.\n\n## 4. Les dashboards se simplifient\n\nLes équipes veulent des indicateurs simples, lisibles et actionnables.\n\n## 5. L''automation gagne la gestion du quotidien\n\nMême les petites structures peuvent automatiser des tâches de base et se concentrer sur le créneau à forte valeur ajoutée.',
      true,
      (select id from public.users where email = 'admin@ramseysdigital.com')
    ),
    (
      'Pourquoi la cybersécurité devient un levier de croissance pour les TPE',
      'pourquoi-la-cybersecurite-devient-un-levier-de-croissance-pour-les-tpe',
      'La sécurité ne se limite plus à la prévention des incidents : elle devient un vrai facteur de confiance et d''efficacité.',
      '# Pourquoi la cybersécurité devient un levier de croissance pour les TPE\n\nLes petites et très petites entreprises ont longtemps considéré la cybersécurité comme une contrainte coûteuse. Aujourd''hui, l''enjeu évolue : la sécurité devient un facteur de différenciation.\n\nUn environnement mieux protégé permet de rassurer les clients, d''éviter les interruptions de service et de mieux exploiter les outils digitaux.\n\n## Ce qui change\n\n- les solutions sont désormais plus accessibles\n- les outils de supervision se simplifient\n- la conformité devient un atout commercial\n\n## En pratique\n\nUne bonne posture sécurité repose sur un petit nombre de gestes : gestion des accès, sauvegardes, sensibilisation et suivi des incidents.\n\nQuand ces bases sont solides, l''entreprise peut avancer plus vite, avec une meilleure confiance.',
      true,
      (select id from public.users where email = 'admin@ramseysdigital.com')
    )
) as values_data(title, slug, excerpt, content, published, author_id)
where author_id is not null
on conflict (slug) do nothing;
