# BAI501 — Family Relations Expert System (PyDatalog)

**Student Name(s) & ID(s):**
- Bassel ALKHATIB, 12345

**Note:** This project runs fully on Google Colab; no external files (No CSV) are required.

---

## Executive Summary

This report details a rule-based expert system for querying complex family relationships using PyDatalog. The project is implemented entirely within a single, self-contained Google Colab notebook (`family_expert_system.ipynb`). It defines a set of base facts (gender, parents, spouses) and derives a comprehensive network of relationships through logical rules.

When the grader executes **"Run all"** in the Colab notebook, each section (Q1–Q9) will sequentially define facts, rules, and then run queries, printing a clearly marked `OUTPUT` block with the results directly below the corresponding code cell.

---

## Environment & Requirements

The project relies on the following tools:

- **Python 3**: The core programming language used for logic and scripting.
- **Google Colab**: The interactive notebook environment for execution and demonstration.
- **pyDatalog**: The logic programming library used to define facts, rules, and run queries.
- **pandas**: Used in historical/unrequired `.py` scripts for data manipulation from CSV files.
- **io**: A standard Python library used in the notebook for handling in-memory text streams.

---

## Project Files Overview

This table provides a concise inventory of every relevant file in the `family-expert-system/` repository.

| Path | Type | Purpose | Key Contents | Used By | Safe to Remove? | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `family_expert_system.ipynb` | Notebook | **Core Project File.** Contains all facts, rules, queries, and outputs. | All logic for Q1–Q9. | Final Deliverable | **No** | This is the only file required for runtime. |
| `README.md` | Markdown | Project overview and instructions. | How to run, project structure. | General Info | No | Provides essential context for the project. |
| `src/facts.py` | Python Module | Loads facts from a CSV file. | `load_facts_into_pydatalog` | Historical | Yes | Logic was migrated into the notebook. |
| `src/rules.py` | Python Module | Defines all family relationship rules. | `define_family_rules` | Historical | Yes | Logic was migrated into the notebook. |
| `src/queries.py` | Python Module | Executes queries against the rules. | `run_all_queries` | Historical | Yes | Logic was migrated into the notebook. |
| `data/family_facts.csv` | Data (CSV) | Contains the raw family data. | Names, genders, parents, spouses. | Historical | Yes | Facts are now hardcoded in the notebook. |
| `tests/test_relations.py` | Python Module | Unit tests for the modularized code. | `pytest` functions. | Historical | Yes | Tests the `.py` scripts, not the notebook. |
| `report.pdf` | Document | A previous version of the project report. | Project summary. | Historical | Yes | Superseded by this `DOCUMENTATION_REPORT.md`. |
| `SUMMARY.md` | Markdown | A brief, high-level summary. | Project goals. | Historical | Yes | Content is covered in this report. |
| `requirements.txt` | Text | Lists project dependencies. | `pandas`, `pyDatalog`. | Historical | Yes | Dependencies are installed via `!pip` in the notebook. |

---

## Relational Data Model

The model represents people as strings and defines relationships using PyDatalog predicates.

### Base Predicates
- `is_male(Person)`: Asserts `Person` is male. (e.g., `is_male('John')`)
- `is_female(Person)`: Asserts `Person` is female. (e.g., `is_female('Mary')`)
- `father(Father, Child)`: Asserts `Father` is the father of `Child`. (e.g., `father('John', 'David')`)
- `mother(Mother, Child)`: Asserts `Mother` is the mother of `Child`. (e.g., `mother('Mary', 'David')`)
- `spouse(Person1, Person2)`: Asserts `Person1` and `Person2` are married. (e.g., `spouse('John', 'Mary')`)

### Core Predicates
- `parent(Parent, Child)`: `Parent` is the father or mother of `Child`. (e.g., `parent('John', 'David')`)
- `child(Child, Parent)`: `Child` is the son or daughter of `Parent`. (e.g., `child('David', 'John')`)
- `son(Son, Parent)`: `Son` is the male child of `Parent`. (e.g., `son('David', 'John')`)
- `daughter(Daughter, Parent)`: `Daughter` is the female child of `Parent`. (e.g., `daughter('Emma', 'John')`)

### Siblings
- `sibling(Person1, Person2)`: `Person1` and `Person2` share at least one parent. (e.g., `sibling('David', 'Emma')`)
- `full_sibling(Person1, Person2)`: Siblings who share both parents. (e.g., `full_sibling('David', 'Emma')`)
- `half_sibling(Person1, Person2)`: Siblings who share only one parent. (e.g., `half_sibling('Ivy', 'Kevin')`)
- `brother(Brother, Person)`: `Brother` is the male sibling of `Person`. (e.g., `brother('David', 'Emma')`)
- `sister(Sister, Person)`: `Sister` is the female sibling of `Person`. (e.g., `sister('Emma', 'David')`)

### Ancestry
- `grandparent(GP, GC)`: `GP` is the parent of a parent of `GC`. (e.g., `grandparent('John', 'Paul')`)
- `grandfather(GF, GC)`: A male grandparent. (e.g., `grandfather('John', 'Paul')`)
- `grandmother(GM, GC)`: A female grandparent. (e.g., `grandmother('Mary', 'Paul')`)
- `great_grandparent(GGP, GGC)`: A parent of a grandparent. (e.g., `great_grandparent('John', 'George')`)
- `ancestor(A, D)`: `A` is a parent, grandparent, great-grandparent, etc., of `D`. (e.g., `ancestor('John', 'George')`)
- `descendant(D, A)`: The inverse of ancestor. (e.g., `descendant('George', 'John')`)

### Extended Family
- `uncle(Uncle, Person)`: `Uncle` is the brother of `Person`'s parent. (e.g., `uncle('Michael', 'Nora')`)
- `aunt(Aunt, Person)`: `Aunt` is the sister of `Person`'s parent. (e.g., `aunt('Diana', 'Paul')`)
- `first_cousin(P1, P2)`: People whose parents are siblings. (e.g., `first_cousin('Nora', 'Kevin')`)
- `second_cousin(P1, P2)`: People whose parents are first cousins. (e.g., `second_cousin('George', 'Isla')`)
- `cousin(P1, P2)`: A general term for first or second cousins.

### In-Laws
- `mother_in_law(MIL, Person)`: `MIL` is the mother of `Person`'s spouse. (e.g., `mother_in_law('Mary', 'Sophia')`)
- `father_in_law(FIL, Person)`: `FIL` is the father of `Person`'s spouse. (e.g., `father_in_law('John', 'Sophia')`)
- `sibling_in_law(SIL, Person)`: `SIL` is the sibling of `Person`'s spouse. (e.g., `sibling_in_law('Emma', 'Michael')`)
- `son_in_law(SIL, Person)`: `SIL` is the husband of `Person`'s daughter. (e.g., `son_in_law('Paul', 'Mary')`)
- `daughter_in_law(DIL, Person)`: `DIL` is the wife of `Person`'s son. (e.g., `daughter_in_law('Sophia', 'John')`)
- `niece(Niece, Person)`: `Niece` is the daughter of `Person`'s sibling. (e.g., `niece('Linda', 'Diana')`)
- `nephew(Nephew, Person)`: `Nephew` is the son of `Person`'s sibling. (e.g., `nephew('Michael', 'Diana')`)

### Step Relationships
- `step_parent(SP, SC)`: `SP` is the spouse of `SC`'s parent, but not a biological parent. (e.g., `step_parent('Peter', 'David')`)
- `step_child(SC, SP)`: The inverse of `step_parent`. (e.g., `step_child('David', 'Peter')`)
- `step_sibling(P1, P2)`: People who share a step-parent. (e.g., `step_sibling('Oliver', 'Emily')`)
- `step_grandparent(SGP, SGC)`: The step-parent of a parent. (e.g., `step_grandparent('Peter', 'Paul')`)

### Advanced (Q8)
- `adoptive_parent(AP, AC)`: `AP` is the adoptive father or mother of `AC`. (e.g., `adoptive_parent('Anna', 'Isla')`)
- `adoptive_child(AC, AP)`: The inverse of `adoptive_parent`.
- `married_more_than_once(Person)`: `Person` has had more than one spouse. (e.g., `married_more_than_once('Mary')`)
- `child_of_multi_spouse_parent(Child)`: `Child`'s parent has been married more than once. (e.g., `child_of_multi_spouse_parent('David')`)
- `step_cousin(P1, P2)`: People whose parents are step-siblings. (e.g., `step_cousin('Oliver', 'George')`)

---

## Rules by Question (Q1–Q9)

### Q1: Individuals and Basic Relationships
- **Question Text**: Define the foundational knowledge: individuals, gender, parents, and spouses.
- **Solution Idea**: Assert base facts using `+ is_male(...)`, `+ father(...)`, etc. Define the fundamental `parent(P, C)` rule as a person who is either a father or a mother.
- **Key Rule**: `parent(P, C) <= father(P, C)` and `parent(P, C) <= mother(P, C)`.
- **Main Queries**: `parent(P, 'David')`, `parent('John', C)`.
- **Expected Output**: Lists of parents, children, and spouses for specific individuals.

### Q2: Core Family Roles
- **Question Text**: Define `child`, `son`, and `daughter`.
- **Solution Idea**: These roles are derived from the `parent` relationship and gender facts.
- **Key Rules**:
  ```prolog
  child(C, P) <= parent(P, C)
  son(C, P) <= child(C, P) & is_male(C)
  daughter(C, P) <= child(C, P) & is_female(C)
  ```
- **Main Queries**: `son(S, 'John')`, `daughter(D, 'John')`.
- **Expected Output**: Lists of sons and daughters for a given parent.

### Q3: Sibling Logic
- **Question Text**: Define rules for `sibling`, `full_sibling`, `half_sibling`, `brother`, and `sister`.
- **Solution Idea**: Siblings share at least one parent. Full siblings share both; half-siblings share one but not both.
- **Key Rules**:
  ```prolog
  sibling(A, B) <= parent(P, A) & parent(P, B) & (A != B)
  full_sibling(A, B) <= father(F, A) & father(F, B) & mother(M, A) & mother(M, B) & (A != B)
  half_sibling(A, B) <= sibling(A, B) & ~full_sibling(A, B)
  ```
- **Main Queries**: `sibling(S, 'Alice')`, `half_sibling(H, 'Michael')`.
- **Expected Output**: Lists of siblings and half-siblings.

### Q4: Ancestry and Descendants
- **Question Text**: Define multi-generational relationships like `grandparent`, `ancestor`, and `descendant`.
- **Solution Idea**: `grandparent` is a parent of a parent. `ancestor` is defined recursively.
- **Key Rules**:
  ```prolog
  grandparent(GP, C) <= parent(GP, P) & parent(P, C)
  ancestor(A, D) <= parent(A, D)
  ancestor(A, D) <= parent(A, P) & ancestor(P, D)
  ```
- **Main Queries**: `ancestor(A, 'Liam')`, `descendant(D, 'Emma')`.
- **Expected Output**: Lists of all ancestors or descendants for an individual.

### Q5: Extended Family (uncle/aunt/cousins)
- **Question Text**: Define rules for uncles, aunts, and cousins.
- **Solution Idea**: These are built on parent and sibling relationships. An uncle is a brother of a parent; cousins have parents who are siblings.
- **Key Rules**:
  ```prolog
  uncle(U, N) <= brother(U, P) & parent(P, N)
  first_cousin(X, Y) <= parent(P1, X) & parent(P2, Y) & sibling(P1, P2) & (X != Y)
  ```
- **Main Queries**: `cousin(C, 'Noah')`, `uncle(U, 'Emily')`.
- **Expected Output**: Lists of extended family members.

### Q6: Spouse Symmetry & In-Laws
- **Question Text**: Define relationships that arise from marriage.
- **Solution Idea**: In-laws are relatives of a spouse. For example, a mother-in-law is the mother of one's spouse.
- **Key Rules**:
  ```prolog
  mother_in_law(M, P) <= spouse(P, S) & mother(M, S)
  sibling_in_law(Sib, P) <= spouse(P, S) & sibling(Sib, S)
  son_in_law(SIL, P) <= spouse(SIL, C) & daughter(C, P)
  ```
- **Main Queries**: `mother_in_law(M, 'James')`, `brother_in_law(B, 'Emily')`.
- **Expected Output**: Lists of in-law relationships.

### Q7: Step Relationships
- **Question Text**: Define relationships formed through remarriage.
- **Solution Idea**: A step-parent is the spouse of a parent, but not a biological parent. Other step-relations derive from this.
- **Key Rule**: `step_parent(S, C) <= spouse(S, P) & parent(P, C) & ~parent(S, C)`.
- **Main Queries**: `step_sibling(S, 'Oliver')`, `step_parent(SP, 'David')`.
- **Expected Output**: Lists of step-relatives.

### Q8: Advanced Family Queries
- **Question Text**: Explore complex structures like adoption, multiple marriages, and step-cousins.
- **Solution Idea**: These rules handle nuanced, blended family dynamics.
- **Key Rules**:
  ```prolog
  adoptive_parent(P, C) <= adoptive_father(P, C)
  married_more_than_once(P) <= spouse(P, S1) & spouse(P, S2) & (S1 != S2)
  step_cousin(X, Y) <= parent(P1, X) & parent(P2, Y) & step_sibling(P1, P2)
  ```
- **Main Queries**: `adoptive_parent(P, 'Isla')`, `child_of_multi_spouse_parent(C)`.
- **Expected Output**: Lists of individuals matching these complex criteria.

### Q9: Generalized/Utility Queries
- **Question Text**: Introduce reusable Python functions to answer structural questions about the family graph.
- **Solution Idea**: Use Python functions to wrap PyDatalog queries, allowing for more complex logic like graph traversal (BFS) to find relatives within N generations or identify disconnected family groups.
- **Key Functions**: `relatives_within_generations(person, n)`, `find_connected_components()`.
- **Main Queries**: `relatives_within_generations('Emily', 2)`.
- **Expected Output**: A dictionary of relatives grouped by generation, or a list of disconnected family groups.

---

## Colab Execution Guide

1.  **Open Notebook**: Upload `family_expert_system.ipynb` to Google Drive and open it with Google Colab.
2.  **Run All**: From the menu, select **Runtime → Run all**.
3.  **View Outputs**: As the cells execute, the output for each question will appear directly below the code cell that contains the queries. Each output block is clearly labeled (e.g., `OUTPUT for Q1`).
4.  **Safety/Repair Cells**: The notebook includes cells that re-declare terms (`pyDatalog.create_terms(...)`). These are "safety" cells designed to be idempotent. They prevent errors from name shadowing or accidental state loss without clearing the underlying facts, ensuring that "Run all" completes successfully every time.

---

## Testing & Verification

The `tests/` directory contains `pytest` unit tests for the modularized Python scripts (`src/*.py`). These tests are historical and do not apply to the final notebook.

The notebook itself can be considered self-verifying. Each query in the `OUTPUT` blocks serves as a test case, demonstrating that the rules produce the expected results for the given set of facts.

---

## Assumptions & Limitations

- **No Adoption Facts**: The base facts include very few adoption scenarios. Queries for adoption may return `(no results)` if no such facts exist for the queried individual.
- **Limited Cousin Scope**: The model explicitly defines rules for `first_cousin` and `second_cousin`. It does not model third cousins or cousins once-removed.
- **Definition Choices**: The definition of `step-cousin` is based on parents who are step-siblings. Other interpretations exist but are not modeled here.
- **Data Completeness**: The accuracy of all inferences depends entirely on the completeness and correctness of the base facts provided in the Q1 code cell.

---

## Appendix

### Glossary
- **Ancestor vs. Grandparent**: A grandparent is an ancestor exactly two generations back. An ancestor can be any number of generations back (parent, grandparent, great-grandparent, etc.).
- **Cousin Degrees**:
  - **First Cousins**: Share grandparents.
  - **Second Cousins**: Share great-grandparents.
- **In-Laws**: Relationships through marriage. Your mother-in-law is your spouse's mother.
- **Step Relations**: Relationships through a parent's remarriage. Your step-father is your mother's new husband.
