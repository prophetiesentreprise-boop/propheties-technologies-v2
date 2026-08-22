# Vérification visuelle — extension des services

## Contrôles effectués

Les parcours ont été vérifiés dans l’aperçu de développement sur écran bureau **1280 × 720** et mobile **375 × 812**. La page d’expertise « Réseaux & installations », la nouvelle page « Téléphonie classique et VoIP », la page Contact et l’accueil ont été contrôlés après les modifications du 21 août 2026.

| Élément contrôlé | Résultat observé |
|---|---|
| Cartes de sous-expertises | Les quatre sujets de l’expertise Réseaux sont visibles, portent un résumé et ouvrent une fiche détaillée. |
| Page VoIP | Le retour vers la famille, l’explication, les étapes, les livrables, les liens vers sujets associés et le CTA sont affichés sur bureau et mobile. |
| Logo | Le logo apparaît agrandi dans un conteneur blanc plus ajusté, dans l’en-tête et le pied de page. |
| Typographie | Les repères et numéros utilisent la nouvelle famille Bricolage Grotesque, plus éditoriale et moins technique. |
| Coordonnées | Les deux numéros, l’e-mail complémentaire et le WhatsApp officiel apparaissent sur la page Contact et dans le pied de page. |
| Mobile | La navigation, les cartes de contact et les contenus détaillés s’empilent sans débordement horizontal visible. |

## Ajustement complémentaire du logo

Après un second contrôle de l’en-tête sur ordinateur et mobile, le visuel de logo a été agrandi dans des conteneurs blancs plus étroits afin de faire disparaître les marges inutiles du fichier source. Le cadrage reste entièrement visible sur mobile, avec le bouton d’écoute et le menu. Le numéro d’appel dans l’en-tête bureau est désormais forcé sur une seule ligne pour préserver l’alignement de la barre de navigation.

## Correction du dépassement du logo

Le cadrage a été rééquilibré après le signalement du propriétaire : l’agrandissement excessif a été retiré, puis remplacé par une échelle intermédiaire. Les contrôles sur ordinateur (**1280 × 720**) et mobile (**375 × 812**) confirment que le logo reste intégralement dans son cadre blanc, sans débordement ni déformation, tout en demeurant clairement lisible.

## Validation sans rognage

Le contrôle final remplace cette échelle intermédiaire par un affichage `object-contain` sans zoom CSS. Les captures ordinateur (**1280 × 720**) et mobile (**375 × 812**) montrent l’intégralité du logo — y compris son libellé inférieur — sans découpe, dépassement ou écrasement. Les cadres ont été conservés dans une taille compacte et homogène entre l’en-tête et le pied de page.

La vérification exploitable repose sur deux éléments complémentaires. D’une part, l’en-tête et le pied de page utilisent chacun un cadre compact de **168 × 66 px** ; leur image occupe ce cadre en `size-full object-contain`, sans classe `scale-*` ni `overflow-hidden` qui pourrait produire une découpe. D’autre part, le test automatisé `SiteLogoContainment.test.ts` contrôle ces deux contraintes pour empêcher le retour d’un zoom rognant. Les captures de référence montrent sur ordinateur et mobile l’icône de circuit, le mot « PROPHETIES » et le libellé « TECHNOLOGIES » entièrement visibles, sans chevauchement avec les contrôles d’en-tête.

Une mesure navigateur reproductible est fournie dans `scripts/verify-logo-layout.mjs`. Elle a contrôlé le rendu réel sur le serveur local : sur ordinateur, le cadre et l’image mesurent tous deux **168 × 66 px** de `x=32` à `x=200`, tandis que le premier contrôle d’en-tête visible commence à `x=747,69`. Sur mobile, le cadre et l’image mesurent également **168 × 66 px** de `x=16` à `x=184`, tandis que le contrôle audio visible commence à `x=267`. Dans les deux cas, la mesure confirme `object-fit: contain`, `transform: none`, image entièrement comprise dans son cadre et absence de chevauchement avec le contrôle d’en-tête.

La même mesure contrôle désormais le pied de page. Sur ordinateur, son cadre et son image mesurent **168 × 66 px** de `x=32` à `x=200`; sur mobile, ils mesurent **168 × 66 px** de `x=16` à `x=184`. Pour les deux formats, l’image de pied de page est entièrement incluse dans son cadre, avec `object-fit: contain` et `transform: none`. Les deux emplacements du logo sont donc vérifiés sans zoom, découpe ni débordement.

## Points à confirmer après publication

La vérification couvre le rendu et les liens présents dans l’aperçu. Un essai réel du lien WhatsApp depuis un téléphone reste recommandé après publication afin de confirmer l’ouverture de l’application associée au numéro **+225 01 50 69 42 43**.

## Pages de sous-expertises approfondies

Les pages **Câblage informatique et télévisuel**, **Wi-Fi, hotspots et portail captif**, **Gouvernance et conformité SSI** ainsi que **PCA, PRA et résilience** ont été revues sur ordinateur (**1280 × 720**) après l’enrichissement éditorial. Chacune présente désormais un titre métier spécifique, un contexte explicatif, un bloc « Quand cette solution est utile », trois sujets d’analyse propres à la prestation, un déroulé d’intervention, les livrables et trois résultats attendus. Les contenus de ces sections ne sont pas réutilisés d’une sous-expertise à l’autre.

Les pages Câblage et PCA/PRA ont également été contrôlées sur mobile (**375 × 812**). Les blocs se placent sur une seule colonne, les cartes sont entièrement visibles, les appels à l’action restent accessibles et les liens vers les autres sous-expertises demeurent lisibles. La suite automatisée contrôle en outre que les **24** sous-expertises disposent chacune de ces champs approfondis dans le registre administrable.

Le script navigateur `scripts/verify-expertise-pages.mjs` a ensuite parcouru les **24** sous-expertises. Pour chacune, il a vérifié le lien depuis sa page de grande expertise, le titre attendu sur la page cible, ainsi que la présence des sections « Le périmètre de la prestation », « Ce que nous livrons » et « Les résultats attendus ». Les **24 parcours** ont été validés avec **7 sections** par page détaillée.

Le même contrôle a été exécuté avec un viewport mobile de **375 × 812**. Les **24 liens** présents dans les pages parentes ont été trouvés et chacun a ouvert la page correspondant à sa sous-expertise, avec le bon titre et les sept sections attendues. Cette vérification couvre ainsi les parcours desktop et mobile de l’ensemble des sous-titres avant publication.
