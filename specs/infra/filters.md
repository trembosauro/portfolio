# Filters Infrastructure

## 1. Contexto

Filtros são utilizados em múltiplas telas do sistema: Contacts, Pipeline, Finanças e Notes. Cada tela implementava sua própria lógica de filtros, resultando em:

- **Duplicação de código** - Lógica de aplicar/limpar/persistir replicada em cada tela
- **Inconsistência de URL** - Cada tela usava convenções diferentes para query params
- **Bugs de estado** - Filtros vazavam entre domínios ou não restauravam corretamente
- **Dificuldade de teste** - Lógica acoplada com UI impossibilitava testes isolados
- **Reset inconsistente** - Alguns filtros resetavam paginação, outros não

A padronização da infraestrutura de filtros permite:

- Comportamento previsível e consistente entre telas
- Sincronização confiável com URL
- Testabilidade isolada
- Integração limpa com busca e paginação
- Evolução centralizada

## 2. Objetivo

Definir um mecanismo único para aplicar, persistir, limpar e restaurar filtros que possa ser usado por múltiplas telas sem duplicação de lógica. O mecanismo deve:

- Ser agnóstico de framework e UI
- Suportar múltiplos tipos de filtros
- Sincronizar bidireccionalmente com URL
- Isolar estado entre domínios
- Coexistir com busca (search.md)
- Resetar dependentes (paginação) quando necessário
- Permitir extensão para casos específicos

## 3. Fora de Escopo

Esta especificação **não cobre**:

- ❌ Componentes visuais de filtro (dropdowns, checkboxes, sliders)
- ❌ UI de seleção ou limpeza
- ❌ Layout, espaçamento ou estilos
- ❌ Design tokens ou temas
- ❌ Animações ou transições
- ❌ Acessibilidade de componentes visuais
- ❌ Framework específico (React, Vue, etc.)

Esses aspectos são responsabilidade da camada de UI, que consome esta infraestrutura através das interfaces definidas.

## 4. Glossário

| Termo | Definição |
|-------|-----------|
| **DomainKey** | Identificador do domínio: `contacts`, `pipeline`, `finances`, `notes` |
| **FilterKey** | Identificador único de um filtro dentro do domínio (ex: `categoryIds`, `status`) |
| **FilterValue** | Valor atual de um filtro (string, string[], boolean, range) |
| **FilterDefinition** | Schema que define tipo, validação e serialização de um filtro |
| **FilterState** | Estado atual de todos os filtros de um domínio |
| **AppliedFilters** | Filtros efetivamente aplicados (após validação) |
| **DefaultValue** | Valor inicial de um filtro quando não especificado |
| **URL Param** | Query parameter no URL que representa um filtro |
| **Namespace** | Prefixo que isola filtros de um domínio no URL |

## 5. Fluxo do Usuário (Abstrato)

### 5.1 Selecionar/Alterar um Filtro

```
1. Usuário altera valor de um filtro
2. Sistema atualiza estado local do filtro
3. Sistema marca estado como "editing"
4. Sistema valida novo valor
5. Se válido, sistema aplica filtro
6. Sistema atualiza URL
7. Sistema marca estado como "applied"
8. Sistema dispara evento FiltersChanged
9. Consumidores (stores de domínio) reagem à mudança
```

### 5.2 Combinar com Busca

```
1. Busca ativa: query = "joao"
2. Usuário aplica filtro: categoryIds = ["cat-1"]
3. Sistema combina: query + filtros
4. URL: /contacts?q=joao&categories=cat-1
5. Resultado: intersecção de busca E filtros
```

### 5.3 Limpar um Filtro

```
1. Usuário aciona limpeza de um filtro específico
2. Sistema reseta valor para defaultValue
3. Sistema remove param do URL (se não for default)
4. Sistema reseta paginação para página 1
5. Sistema dispara evento FilterCleared
```

### 5.4 Limpar Todos os Filtros

```
1. Usuário aciona "limpar todos"
2. Sistema reseta todos os filtros para defaultValue
3. Sistema remove todos os params de filtro do URL
4. Sistema preserva busca (se ativa)
5. Sistema reseta paginação para página 1
6. Sistema marca estado como "cleared"
7. Sistema dispara evento FiltersCleared
```

### 5.5 Restaurar Filtros via URL

```
1. Usuário navega para URL com params de filtro
2. Sistema extrai params relevantes do URL
3. Sistema valida cada valor
4. Valores válidos: aplicados ao estado
5. Valores inválidos: ignorados, usa defaultValue
6. Sistema marca estado como "applied"
7. Consumidores reagem aos filtros iniciais
```

### 5.6 Navegar Back/Forward

```
1. Usuário está em /contacts?categories=cat-1
2. Usuário aplica novo filtro: status=active
3. URL: /contacts?categories=cat-1&status=active
4. Usuário clica "voltar"
5. URL: /contacts?categories=cat-1
6. Sistema detecta mudança de URL
7. Sistema restaura estado: categoryIds=["cat-1"], status=default
8. Consumidores reagem às mudanças
```

## 6. Regras de Negócio

| ID | Regra | Descrição |
|----|-------|-----------|
| RN01 | Determinístico | Mesmos filtros sempre produzem mesmo resultado |
| RN02 | Serializável | Todo filtro deve ser representável como string para URL |
| RN03 | Ordem irrelevante | `a=1&b=2` equivale a `b=2&a=1` (normalização) |
| RN04 | Reset paginação | Alterar filtros reseta paginação para página 1 |
| RN05 | Coexistência | Filtros coexistem com busca sem conflito |
| RN06 | URL sync | Filtros ativos refletem no URL em tempo real |
| RN07 | Fallback seguro | Valores inválidos no URL usam defaultValue |
| RN08 | Isolamento | Filtros não vazam entre domínios |
| RN09 | Default oculto | Filtro com valor default não aparece no URL |
| RN10 | Validação | Valores são validados antes de aplicar |
| RN11 | Dependências | Filtros podem depender de outros (ex: subcategoria depende de categoria) |

## 7. Tipos de Filtros Suportados

### 7.1 Single-Select

Seleção única de um valor entre opções.

```typescript
interface SingleSelectFilter {
  type: 'single-select';
  value: string | null;
  options: string[];
  defaultValue: string | null;
}

// Serialização
serialize: (value) => value || ''
parse: (param) => param || null
validate: (value, options) => value === null || options.includes(value)

// URL
// ?status=active
```

### 7.2 Multi-Select

Seleção múltipla de valores.

```typescript
interface MultiSelectFilter {
  type: 'multi-select';
  value: string[];
  options: string[];
  defaultValue: string[];
}

// Serialização
serialize: (value) => value.sort().join(',')
parse: (param) => param ? param.split(',').filter(Boolean) : []
validate: (value, options) => value.every(v => options.includes(v))

// URL (valores ordenados alfabeticamente para determinismo)
// ?categories=cat-1,cat-2,cat-3
```

### 7.3 Boolean

Toggle verdadeiro/falso.

```typescript
interface BooleanFilter {
  type: 'boolean';
  value: boolean;
  defaultValue: boolean;
}

// Serialização
serialize: (value) => value ? '1' : '0'
parse: (param) => param === '1'
validate: (value) => typeof value === 'boolean'

// URL
// ?archived=1 (true)
// ?archived=0 (false)
// ausente = default
```

### 7.4 Range

Intervalo numérico com min/max.

```typescript
interface RangeFilter {
  type: 'range';
  value: { min: number | null; max: number | null };
  bounds: { min: number; max: number };
  defaultValue: { min: null; max: null };
}

// Serialização
serialize: (value) => {
  const parts = [];
  if (value.min !== null) parts.push(`min:${value.min}`);
  if (value.max !== null) parts.push(`max:${value.max}`);
  return parts.join(',');
}
parse: (param) => {
  const result = { min: null, max: null };
  param.split(',').forEach(part => {
    const [key, val] = part.split(':');
    if (key === 'min') result.min = Number(val);
    if (key === 'max') result.max = Number(val);
  });
  return result;
}
validate: (value, bounds) => {
  if (value.min !== null && value.min < bounds.min) return false;
  if (value.max !== null && value.max > bounds.max) return false;
  if (value.min !== null && value.max !== null && value.min > value.max) return false;
  return true;
}

// URL
// ?amount=min:100,max:500
// ?amount=min:100 (só mínimo)
// ?amount=max:500 (só máximo)
```

### 7.5 Enum

Valor único de conjunto fixo (type-safe).

```typescript
interface EnumFilter<T extends string> {
  type: 'enum';
  value: T;
  options: readonly T[];
  defaultValue: T;
}

// Serialização
serialize: (value) => value
parse: (param, options) => options.includes(param) ? param : null
validate: (value, options) => options.includes(value)

// URL
// ?priority=high
```

## 8. Modelo de Dados

### 8.1 Filter Definition

```typescript
interface FilterDefinition<T = unknown> {
  /** Identificador único do filtro */
  key: string;
  
  /** Tipo do filtro */
  type: 'single-select' | 'multi-select' | 'boolean' | 'range' | 'enum';
  
  /** Valor padrão quando não especificado */
  defaultValue: T;
  
  /** Opções válidas (para select/enum) */
  options?: readonly string[];
  
  /** Limites (para range) */
  bounds?: { min: number; max: number };
  
  /** Nome do param no URL */
  urlParam: string;
  
  /** Serializa valor para string (URL) */
  serialize: (value: T) => string;
  
  /** Parse string para valor tipado */
  parse: (param: string) => T;
  
  /** Valida se valor é aceito */
  validate: (value: T) => boolean;
  
  /** Filtros dos quais este depende */
  dependsOn?: string[];
}
```

### 8.2 Filter State

```typescript
interface FilterState {
  /** Domínio deste estado de filtros */
  domainKey: DomainKey;
  
  /** Valores atuais de cada filtro */
  values: Record<string, unknown>;
  
  /** Valores efetivamente aplicados (após validação) */
  appliedValues: Record<string, unknown>;
  
  /** Status atual */
  status: FilterStatus;
  
  /** Indica se há filtros ativos (diferentes do default) */
  hasActiveFilters: boolean;
  
  /** Quantidade de filtros ativos */
  activeFilterCount: number;
  
  /** Timestamp da última aplicação */
  appliedAt: number | null;
}

type DomainKey = 'contacts' | 'pipeline' | 'finances' | 'notes';

type FilterStatus = 
  | 'idle'     // Estado inicial
  | 'editing'  // Usuário está alterando
  | 'applied'  // Filtros aplicados
  | 'cleared'; // Filtros foram limpos
```

### 8.3 Filter Actions

```typescript
interface FilterActions {
  /** Atualiza valor de um filtro específico */
  setValue: (key: string, value: unknown) => void;
  
  /** Aplica todos os filtros pendentes */
  apply: () => void;
  
  /** Limpa um filtro específico (volta ao default) */
  clearOne: (key: string) => void;
  
  /** Limpa todos os filtros */
  clearAll: () => void;
  
  /** Verifica se filtro está ativo (diferente do default) */
  isActive: (key: string) => boolean;
  
  /** Obtém valor atual de um filtro */
  getValue: <T>(key: string) => T;
  
  /** Inicializa a partir do URL */
  initFromUrl: () => void;
  
  /** Sincroniza estado com URL */
  syncToUrl: () => void;
  
  /** Reseta dependentes (paginação) */
  resetDependents: () => void;
}
```

### 8.4 Filter Events

```typescript
interface FiltersAppliedEvent {
  type: 'filters_applied';
  domainKey: DomainKey;
  filters: Record<string, unknown>;
  activeCount: number;
  timestamp: number;
}

interface FiltersClearedEvent {
  type: 'filters_cleared';
  domainKey: DomainKey;
  previousFilters: Record<string, unknown>;
  timestamp: number;
}

interface FilterChangedEvent {
  type: 'filter_changed';
  domainKey: DomainKey;
  filterKey: string;
  previousValue: unknown;
  newValue: unknown;
  timestamp: number;
}
```

### 8.5 Dependências entre Filtros

```typescript
interface FilterDependency {
  /** Filtro que depende */
  dependent: string;
  
  /** Filtro do qual depende */
  dependsOn: string;
  
  /** Ação quando dependência muda */
  onDependencyChange: 'reset' | 'filter-options' | 'disable';
}

// Exemplo: subcategoria depende de categoria
const dependencies: FilterDependency[] = [
  {
    dependent: 'subcategoryId',
    dependsOn: 'categoryId',
    onDependencyChange: 'reset', // Reseta subcategoria quando categoria muda
  },
];
```

## 9. Serialização e URL

### 9.1 Convenção de Namespace

Cada domínio usa prefixo para evitar conflitos:

| Domínio | Prefixo | Exemplo |
|---------|---------|---------|
| contacts | `c_` | `c_categories=cat-1` |
| pipeline | `p_` | `p_status=active` |
| finances | `f_` | `f_amount=min:100` |
| notes | `n_` | `n_archived=1` |

**Alternativa**: Namespace por rota (sem prefixo, pois cada rota é isolada).

```
/contacts?categories=cat-1&status=active
/pipeline?status=pending&priority=high
```

### 9.2 Regras de Serialização

#### Multi-Select

```
// Valores ordenados alfabeticamente, separados por vírgula
categories=cat-1,cat-2,cat-3

// Vazio = param ausente (não categories=)
```

#### Range

```
// Min e max separados por vírgula
amount=min:100,max:500

// Só min
amount=min:100

// Só max  
amount=max:500
```

#### Boolean

```
// True
archived=1

// False
archived=0

// Default = param ausente
```

### 9.3 Regras de Escrita

```typescript
function syncFiltersToUrl(state: FilterState, definitions: FilterDefinition[]) {
  const url = new URL(window.location.href);
  
  definitions.forEach(def => {
    const value = state.appliedValues[def.key];
    const isDefault = deepEqual(value, def.defaultValue);
    
    if (isDefault) {
      // Remove param se é valor default
      url.searchParams.delete(def.urlParam);
    } else {
      // Serializa e adiciona
      const serialized = def.serialize(value);
      url.searchParams.set(def.urlParam, serialized);
    }
  });
  
  // Preserva outros params (q, page, etc.)
  history.replaceState(null, '', url.toString());
}
```

### 9.4 Regras de Leitura

```typescript
function initFiltersFromUrl(definitions: FilterDefinition[]): Record<string, unknown> {
  const url = new URL(window.location.href);
  const values: Record<string, unknown> = {};
  
  definitions.forEach(def => {
    const param = url.searchParams.get(def.urlParam);
    
    if (param === null) {
      // Param ausente = default
      values[def.key] = def.defaultValue;
    } else {
      // Tenta parse
      const parsed = def.parse(param);
      
      // Valida
      if (def.validate(parsed)) {
        values[def.key] = parsed;
      } else {
        // Valor inválido = fallback para default
        console.warn(`Invalid filter value for ${def.key}: ${param}`);
        values[def.key] = def.defaultValue;
      }
    }
  });
  
  return values;
}
```

### 9.5 Back/Forward

```typescript
// Listener para popstate (back/forward)
window.addEventListener('popstate', () => {
  const newValues = initFiltersFromUrl(definitions);
  filterState.appliedValues = newValues;
  filterState.values = newValues;
  filterState.status = 'applied';
  notifyConsumers();
});
```

## 10. Integração com Paginação e Ordenação

### 10.1 Reset de Paginação

```typescript
// Qualquer mudança de filtro reseta paginação
function applyFilters() {
  // ... aplicar filtros ...
  
  // Reset page para 1
  if (paginationState) {
    paginationState.currentPage = 1;
    url.searchParams.set('page', '1');
  }
}
```

### 10.2 Limpar Tudo

```typescript
function clearAllFilters() {
  // Reset filtros
  definitions.forEach(def => {
    state.values[def.key] = def.defaultValue;
  });
  
  // Reset paginação
  if (paginationState) {
    paginationState.currentPage = 1;
  }
  
  // Opcional: reset ordenação
  // sortState.sortBy = defaultSort;
  
  syncToUrl();
}
```

### 10.3 URL Completo

```
/contacts?q=joao&categories=cat-1,cat-2&status=active&page=2&sort=name
         ^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^ ^^^^^^^^^
         busca  filtros                                    page   sort
```

## 11. Edge Cases

### 11.1 URL com Valores Inválidos

| Cenário | Comportamento |
|---------|---------------|
| `?categories=invalid-id` | Ignora valor, usa default |
| `?status=xyz` | Ignora valor, usa default |
| `?amount=abc` | Ignora valor, usa default |
| `?archived=maybe` | Ignora valor, usa default |

```typescript
// Log de warning para debugging
console.warn(`[Filters] Invalid value for "${key}": "${param}", using default`);
```

### 11.2 Multi-Select Vazio

```typescript
// URL: ?categories=
// Parse: []
// Tratamento: equivalente a "nenhum selecionado" ou "todos"
// Depende da regra de negócio do domínio

// Opção A: Nenhum = Todos (sem filtro)
if (categories.length === 0) {
  // Não filtra por categoria
}

// Opção B: Nenhum = Nada (resultado vazio)
if (categories.length === 0) {
  return [];
}
```

### 11.3 Range Parcial

```typescript
// URL: ?amount=min:100
// Interpretação: amount >= 100, sem limite superior

// URL: ?amount=max:500
// Interpretação: amount <= 500, sem limite inferior

// Validação de range
function validateRange(value: Range, bounds: Bounds): boolean {
  if (value.min !== null && value.max !== null) {
    return value.min <= value.max;
  }
  return true; // Parcial é válido
}
```

### 11.4 Filtros Conflitantes

```typescript
// Cenário: filtro A exclui opções de filtro B
// Exemplo: status="archived" conflita com view="active"

interface FilterConflict {
  filterA: { key: string; value: unknown };
  filterB: { key: string; value: unknown };
  resolution: 'keep-a' | 'keep-b' | 'clear-both';
}

// Resolução automática
function resolveConflicts(values: Record<string, unknown>): Record<string, unknown> {
  conflicts.forEach(conflict => {
    if (hasConflict(values, conflict)) {
      switch (conflict.resolution) {
        case 'keep-a':
          values[conflict.filterB.key] = getDefault(conflict.filterB.key);
          break;
        // ...
      }
    }
  });
  return values;
}
```

### 11.5 Mudança de Domínio

```typescript
// Navegação de /contacts?categories=cat-1 para /pipeline

// Estado de contacts é preservado isoladamente
// Pipeline inicia com seus próprios filtros (do URL ou default)

// Não há vazamento: cada domínio tem seu próprio FilterState
const contactsFilters = createFilters({ domainKey: 'contacts', ... });
const pipelineFilters = createFilters({ domainKey: 'pipeline', ... });
```

### 11.6 Filtros com Dependências

```typescript
// Cenário: categoria -> subcategoria

// 1. Usuário seleciona categoria "Tecnologia"
// 2. Subcategorias disponíveis: ["Frontend", "Backend", "DevOps"]
// 3. Usuário seleciona "Frontend"
// 4. Usuário muda categoria para "Marketing"
// 5. Sistema reseta subcategoria (não existe "Frontend" em Marketing)

function handleDependencyChange(changedKey: string) {
  const dependents = definitions.filter(d => d.dependsOn?.includes(changedKey));
  
  dependents.forEach(dep => {
    // Reset para default ou filtra opções
    state.values[dep.key] = dep.defaultValue;
  });
}
```

## 12. Observabilidade

### 12.1 Eventos

| Evento | Payload | Quando |
|--------|---------|--------|
| `filters_applied` | `{ domainKey, filters, activeCount }` | Filtros aplicados |
| `filters_cleared` | `{ domainKey, previousFilters }` | Todos filtros limpos |
| `filter_changed` | `{ domainKey, filterKey, prev, new }` | Filtro individual alterado |
| `filter_restored` | `{ domainKey, filters, fromUrl }` | Estado restaurado do URL |
| `filter_invalid` | `{ domainKey, filterKey, value, reason }` | Valor inválido recebido |

### 12.2 Métricas

```typescript
interface FilterMetrics {
  /** Quantidade de filtros ativos */
  activeFilterCount: number;
  
  /** Filtros mais usados */
  filterUsage: Record<string, number>;
  
  /** Tempo médio com filtros ativos */
  avgFilterDuration: number;
  
  /** Taxa de uso de "limpar todos" */
  clearAllRate: number;
}
```

### 12.3 Logging

```typescript
// Formato de log estruturado
{
  level: 'info',
  event: 'filters_applied',
  domainKey: 'contacts',
  filters: {
    categories: ['cat-1', 'cat-2'],
    status: 'active'
  },
  activeCount: 2,
  timestamp: 1735228800000
}
```

## 13. Critérios de Aceitação Testáveis

### 13.1 Aplicação de Filtros

- [ ] `GIVEN` filtro categories vazio `WHEN` selecionar "cat-1" `THEN` URL contém categories=cat-1
- [ ] `GIVEN` filtro status default `WHEN` alterar para "active" `THEN` estado.hasActiveFilters = true
- [ ] `GIVEN` múltiplos filtros `WHEN` aplicar `THEN` URL contém todos os params

### 13.2 Restauração via URL

- [ ] `GIVEN` URL /contacts?categories=cat-1 `WHEN` carregar página `THEN` filtro categories = ["cat-1"]
- [ ] `GIVEN` URL com valor inválido `WHEN` carregar `THEN` usa defaultValue sem erro
- [ ] `GIVEN` URL sem params de filtro `WHEN` carregar `THEN` todos filtros em default

### 13.3 Limpeza de Filtros

- [ ] `GIVEN` filtro ativo `WHEN` clearOne(key) `THEN` filtro volta ao default
- [ ] `GIVEN` filtro ativo `WHEN` clearOne(key) `THEN` param removido do URL
- [ ] `GIVEN` múltiplos filtros ativos `WHEN` clearAll() `THEN` todos voltam ao default
- [ ] `GIVEN` filtros + paginação página 3 `WHEN` clearAll() `THEN` página volta para 1

### 13.4 Isolamento entre Domínios

- [ ] `GIVEN` filtro em contacts `WHEN` navegar para pipeline `THEN` pipeline não tem filtro
- [ ] `GIVEN` filtros em contacts e pipeline `WHEN` verificar estados `THEN` são independentes
- [ ] `GIVEN` limpar filtros em contacts `WHEN` verificar pipeline `THEN` pipeline inalterado

### 13.5 Integração com Busca

- [ ] `GIVEN` busca "joao" ativa `WHEN` aplicar filtro category `THEN` ambos no URL
- [ ] `GIVEN` busca + filtros `WHEN` limpar filtros `THEN` busca preservada
- [ ] `GIVEN` busca + filtros `WHEN` verificar resultado `THEN` intersecção aplicada

### 13.6 URL Sync

- [ ] `GIVEN` filtros aplicados `WHEN` browser back `THEN` estado anterior restaurado
- [ ] `GIVEN` filtros aplicados `WHEN` browser forward `THEN` estado seguinte restaurado
- [ ] `GIVEN` valor default `WHEN` verificar URL `THEN` param não presente

### 13.7 Validação

- [ ] `GIVEN` multi-select com opções [a,b,c] `WHEN` parse "a,d" `THEN` apenas "a" aceito
- [ ] `GIVEN` range bounds [0,1000] `WHEN` valor min:2000 `THEN` usa default
- [ ] `GIVEN` boolean filter `WHEN` parse "maybe" `THEN` usa default

### 13.8 Reset de Paginação

- [ ] `GIVEN` página 5 ativa `WHEN` alterar qualquer filtro `THEN` página = 1
- [ ] `GIVEN` página 3 + filtros `WHEN` clearAll() `THEN` página = 1

## 14. Integração com Domínios

### 14.1 Contrato de Uso

Cada domínio que usa filtros deve:

```typescript
// 1. Definir seus filtros
const contactsFilterDefinitions: FilterDefinition[] = [
  {
    key: 'categoryIds',
    type: 'multi-select',
    urlParam: 'categories',
    defaultValue: [],
    options: [], // Carregado dinamicamente
    serialize: (v) => v.sort().join(','),
    parse: (p) => p ? p.split(',') : [],
    validate: (v) => Array.isArray(v),
  },
  {
    key: 'hasEmail',
    type: 'boolean',
    urlParam: 'has_email',
    defaultValue: false,
    serialize: (v) => v ? '1' : '0',
    parse: (p) => p === '1',
    validate: (v) => typeof v === 'boolean',
  },
];

// 2. Criar instância de filters
const contactsFilters = createFilters({
  domainKey: 'contacts',
  definitions: contactsFilterDefinitions,
});

// 3. Reagir a mudanças nos filtros
effect(() => {
  const filtered = contacts.filter(contact => 
    matchesFilters(contact, contactsFilters.appliedValues)
  );
  setFilteredContacts(filtered);
});

// 4. Conectar ações
function onCategoryChange(ids: string[]) {
  contactsFilters.setValue('categoryIds', ids);
}

function onClearFilters() {
  contactsFilters.clearAll();
}
```

### 14.2 Função de Match

Cada domínio implementa sua própria lógica de filtro:

```typescript
// contacts
function matchesFilters(contact: Contact, filters: AppliedFilters): boolean {
  // Category filter
  if (filters.categoryIds.length > 0) {
    const hasMatch = contact.categoryIds.some(id => 
      filters.categoryIds.includes(id)
    );
    if (!hasMatch) return false;
  }
  
  // Boolean filter
  if (filters.hasEmail && contact.emails.length === 0) {
    return false;
  }
  
  return true;
}

// finances
function matchesFilters(expense: Expense, filters: AppliedFilters): boolean {
  // Category
  if (filters.categoryIds.length > 0) {
    if (!filters.categoryIds.includes(expense.categoryId)) {
      return false;
    }
  }
  
  // Range
  if (filters.amountRange.min !== null) {
    if (expense.amount < filters.amountRange.min) return false;
  }
  if (filters.amountRange.max !== null) {
    if (expense.amount > filters.amountRange.max) return false;
  }
  
  return true;
}
```
