import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../Components/auth/AuthContext";

const API = import.meta.env.VITE_API_URL;

type ApiCharacter = {
    charId?: number;
    CharId?: number;
    name?: string;
    Name?: string;
    rarity?: string;
    Rarity?: string;
    element?: string;
    Element?: string;
    series?: string;
    Series?: string;
    charUrl?: string;
    CharUrl?: string;
    owned?: boolean;
    Owned?: boolean;
    awakening?: number;
};

interface Character {
    CharId: number;
    Name: string;
    Rarity: string;
    Element: string;
    Series: string;
    CharUrl: string;
    Owned: boolean;
    Awakening: number;
}

export function CollectionPage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    const [search, setSearch] = useState("");
    const [filterRarity, setFilterRarity] = useState("");
    const [filterElement, setFilterElement] = useState("");
    const [showOwnedOnly, setShowOwnedOnly] = useState(false);

    const { user } = useAuth();

    const normalize = (a: ApiCharacter): Character => ({
        CharId: (a.charId ?? a.CharId) as number,
        Name: (a.name ?? a.Name ?? "") as string,
        Rarity: (a.rarity ?? a.Rarity ?? "").toString(),
        Element: (a.element ?? a.Element ?? "").toString(),
        Series: (a.series ?? a.Series ?? "").toString(),
        CharUrl: (a.charUrl ?? a.CharUrl ?? "").toString(),
        Owned: Boolean(a.owned ?? a.Owned),
        Awakening: a.awakening ?? 0,
    });

    const fetchCharacters = async () => {
        try {
            setLoading(true);
            setError("");

            const headers: Record<string, string> = { "Accept": "application/json" };
            const options: RequestInit = { method: "GET", headers };

            if (user?.token) {
                headers["Authorization"] = `Bearer ${user.token}`;
            } else {
                options.credentials = "include"; // only for guests if backend uses cookies
            }

            const res = await fetch(`${API}/api/collection/characters`, options);
            if (!res.ok) throw new Error(await res.text());
            const raw: ApiCharacter[] = await res.json();
            setCharacters(raw.map(normalize));
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("Fetching Error:", error);
            setError(error.message || "Failed to fetch characters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCharacters();
    }, [user?.token]);

    const rarities = useMemo(
        () => Array.from(new Set(characters.map(c => c.Rarity.trim()))).filter(Boolean),
        [characters]
    );
    const elements = useMemo(
        () => Array.from(new Set(characters.map(c => c.Element))).filter(Boolean),
        [characters]
    );

    const filtered = useMemo(() => {
        return characters.filter(c => {
            if (filterRarity && c.Rarity.trim() !== filterRarity) return false;
            if (filterElement && c.Element !== filterElement) return false;
            if (search && !c.Name.toLowerCase().includes(search.toLowerCase())) return false;
            if (showOwnedOnly && !c.Owned) return false;
            return true;
        });
    }, [characters, filterRarity, filterElement, search, showOwnedOnly]);

    const toggleCharacter = async (charId: number) => {
        if (!user?.token) return alert("Not logged in");

        setCharacters(prev => prev.map(c => c.CharId === charId ? { ...c, Owned: !c.Owned } : c));

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            };

            const res = await fetch(`${API}/api/collection/awakening/${charId}`, {
                method: "POST",
                headers
            });

            if (!res.ok) throw new Error(await res.text());
            const body = await res.json().catch(() => ({}));
            const added = body.Added ?? body.added ?? null;
            if (added !== null) {
                setCharacters(prev => prev.map(c => c.CharId === charId ? { ...c, Owned: Boolean(added) } : c));
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("Collection error:", error);
            alert(error.message || "Could not update collection");

            setCharacters(prev => prev.map(c => c.CharId === charId ? { ...c, Owned: !c.Owned } : c));
        }
    };

    const setAwakening = async (charId: number, level: number) => {
        if (!user?.token) return;

        setCharacters(prev => prev.map(c => c.CharId === charId ? { ...c, Awakening: level } : c));

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            };
            const res = await fetch(`${API}/api/collection/awakening/${charId}`, {
                method: "POST",
                headers,
                body: JSON.stringify({ level }),
            });

            if (!res.ok) throw new Error(await res.text());
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("Set awakening error:", error);
            alert(error.message || "Failed to update awakening");
        }
    };

    if (loading) return <p className="p-4">Loading characters...</p>;
    if (error) return <p className="p-4 text-red-600">Error: {error}</p>;

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">Collection</h1>
            <div className="flex gap-3 mb-4 flex-wrap items-center">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search name..."
                    className="border p-1 rounded"
                />
                <select
                    value={filterRarity}
                    onChange={e => setFilterRarity(e.target.value)}
                    className="border p-1 rounded"
                >
                    <option value="">All Rarities</option>
                    {rarities.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select
                    value={filterElement}
                    onChange={e => setFilterElement(e.target.value)}
                    className="border p-1 rounded"
                >
                    <option value="">All Elements</option>
                    {elements.map(el => <option key={el} value={el}>{el}</option>)}
                </select>
                <button
                    onClick={() => { setSearch(""); setFilterElement(""); setFilterRarity(""); }}
                    className="bg-red-500 text-white px-4 rounded"
                >
                    Clear
                </button>
                <button
                    onClick={() => setShowOwnedOnly(prev => !prev)}
                    className={`px-3 py-1 rounded text-white transition
                    ${showOwnedOnly ? "bg-purple-500" : "bg-gray-400"}`}
                >
                    Owned Only
                </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filtered.map(c => (
                    <div key={c.CharId} className={`border-4 rounded p-2 ${c.Owned ? "bg-green-100 border-green-400" : "bg-white border-purple-500"}`}>
                        <a href={c.CharUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
                            <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded mb-2">
                                <span className="text-gray-600 text-sm">Open Wiki</span>
                            </div>
                        </a>
                        <p className="text-center font-semibold">{c.Name}</p>
                        <p className="text-xs text-gray-600 text-center">{c.Rarity.trim()} | {c.Element}</p>
                        <div className="mt-2">
                            <button
                                onClick={() => toggleCharacter(c.CharId)}
                                className={`cursor-pointer w-full py-1 text-xs rounded ${c.Owned ? "bg-red-500 text-white" : "bg-purple-500 text-white"}`}
                            >
                                {c.Owned ? "Remove" : "Add"}
                            </button>
                        </div>
                        {c.Owned && (
                            <div className="mt-2 flex justify-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <span key={i}
                                        onClick={() => setAwakening(c.CharId, i + 1)}
                                        className={`cursor-pointer ${i < c.Awakening ? "text-yellow-400" : "text-gray-300"}`}>
                                        ★
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
