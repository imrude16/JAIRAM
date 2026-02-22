//Permission Helpers (Ownership Check) -> User editing someone else's journal (Shouldn't be allowed)
const canAccessJournal = (journal, user) => {
    if (user.role === "ADMIN") return true;

    if (journal.author.toString() === user.id) return true;

    return false;
};

export {
    canAccessJournal,
};