using GrandmastersHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GrandmastersHub.Infrastructure.Data;

public static class PostgresDemoSeeder
{
    private sealed record DemoProduct(
        string Slug,
        string Name,
        string Category,
        decimal Price,
        string Description,
        string ImageUrl,
        string VariantName,
        int Quantity);

    private static readonly DemoProduct[] Products =
    [
        new("demo-classic-walnut-chess-board", "Classic Walnut Chess Board", "Boards", 895m, "A warm walnut-style board with clear coordinates and a felt-lined base. A welcoming centrepiece for weekly games.", "/images/Shopping-plain-chess-board.jpg", "Walnut finish", 24),
        new("demo-ebony-tournament-board", "Ebony Tournament Board", "Boards", 1295m, "Bold black-and-white squares, a broad playing area and a clean border. Built for focused club nights and longer matches.", "/images/shopping-black-white-board.png", "Tournament size", 12),
        new("demo-folding-travel-chess-board", "Folding Travel Chess Board", "Boards", 549m, "A compact folding board for holidays, lunch breaks and games on the move. Easy to pack and quick to set up.", "/images/Shopping-plain-chess-board.jpg", "Travel size", 32),
        new("demo-club-practice-chess-board", "Club Practice Chess Board", "Boards", 349m, "An affordable everyday board with easy-to-read squares. A practical choice for beginners, schools and chess clubs.", "/images/shopping-black-white-board.png", "Standard", 48),
        new("demo-grandmaster-walnut-board", "Grandmaster Walnut Board", "Boards", 1895m, "A large-format walnut-style board with a wide frame and a smooth finish. Extra room for analysis sessions and tournament pieces.", "/images/Shopping-plain-chess-board.jpg", "Large format", 8),
        new("demo-championship-display-board", "Championship Display Board", "Boards", 2495m, "A striking monochrome display board with a generous frame. Made to look at home on a study desk or games-room table.", "/images/shopping-black-white-board.png", "Display edition", 5),
        new("demo-club-digital-chess-clock", "Club Digital Chess Clock", "Clocks", 459m, "A straightforward digital timer with two clear displays. Set a time control, press start and get straight into the game.", "/images/Digital-clock.png", "Digital", 36),
        new("demo-blitz-tournament-timer", "Blitz Tournament Timer", "Clocks", 699m, "Large buttons and an easy-to-read display for fast games. A dependable companion for blitz evenings with friends.", "/images/Digital-clock.png", "Digital", 18),
        new("demo-classic-analogue-chess-clock", "Classic Analogue Chess Clock", "Clocks", 595m, "Traditional twin dials with a simple mechanical feel. An old-school finish for a wooden board and a quiet afternoon of chess.", "/images/Shopping-clock-1.png", "Analogue", 14),
        new("demo-dual-display-competition-clock", "Dual Display Competition Clock", "Clocks", 999m, "A competition-style digital timer with clear remaining-time displays. Suitable for practice sessions with custom time controls.", "/images/Digital-clock.png", "Competition edition", 10),
        new("demo-rapid-play-digital-timer", "Rapid Play Digital Timer", "Clocks", 379m, "A compact timer for casual rapid games and classroom practice. Simple controls make it approachable for new players.", "/images/Digital-clock.png", "Digital", 42),
        new("demo-heritage-match-clock", "Heritage Match Clock", "Clocks", 1495m, "A classic twin-dial clock with a refined tabletop presence. Pair it with a traditional board for a complete study set.", "/images/Shopping-clock-1.png", "Heritage edition", 6),
        new("demo-club-players-handbook", "The Club Player's Handbook", "Books", 295m, "A practical handbook covering opening habits, practical plans and common mistakes. A friendly starting point for new club players.", "/images/book-1.png", "Paperback", 40),
        new("demo-tactics-before-coffee", "Tactics Before Coffee", "Books", 249m, "A collection of bite-sized tactical puzzles. Practise forks, pins and discovered attacks in short daily sessions.", "/images/book-1.png", "Paperback", 55),
        new("demo-endgames-made-practical", "Endgames Made Practical", "Books", 379m, "A guide to king activity, pawn races and rook endings. Work through practical positions one idea at a time.", "/images/book-1.png", "Paperback", 22),
        new("demo-opening-workshop", "The Opening Workshop", "Books", 429m, "An opening study guide focused on plans rather than memorised moves. Includes exercises for building a personal repertoire.", "/images/book-1.png", "Hardcover", 16),
        new("demo-positional-chess-explained", "Positional Chess Explained", "Books", 349m, "A guide to weak squares, open files and better piece placement. Designed for players ready to look beyond immediate tactics.", "/images/book-1.png", "Paperback", 28),
        new("demo-tournament-preparation-journal", "Tournament Preparation Journal", "Books", 199m, "A study journal with space for game notes, training goals and post-match analysis. Keep your preparation in one place.", "/images/book-1.png", "Paperback", 64),
        new("demo-volcanic-obsidian-chess-set", "Volcanic Obsidian Chess Set", "Bespoke", 4995m, "A dramatic black-stone-style set with contrasting pieces and a sculpted finish. A statement centrepiece for the dedicated chess enthusiast.", "/images/Volcanic.png", "Obsidian finish", 4),
        new("demo-midnight-collector-chess-set", "Midnight Collector Chess Set", "Bespoke", 6495m, "Deep tones and sculptural pieces give this collector-style set its character. Intended for display as well as slow, thoughtful games.", "/images/Volcanic.png", "Midnight finish", 3),
        new("demo-heritage-artisan-chess-set", "Heritage Artisan Chess Set", "Bespoke", 3995m, "An artisan-inspired set with traditional silhouettes and a substantial board. A memorable gift for a player building a personal collection.", "/images/Volcanic.png", "Heritage finish", 7),
        new("demo-royal-contrast-chess-set", "Royal Contrast Chess Set", "Bespoke", 5495m, "Light and dark pieces create a strong visual contrast across the board. A collector-style set with a formal tabletop presence.", "/images/Volcanic.png", "Royal edition", 5),
        new("demo-monochrome-signature-chess-set", "Monochrome Signature Chess Set", "Bespoke", 2995m, "A restrained monochrome set with clean piece shapes. A simple display option for a modern office or study.", "/images/Volcanic.png", "Signature edition", 9),
        new("demo-grandmaster-commission-chess-set", "Grandmaster Commission Chess Set", "Bespoke", 8995m, "A commission-style showcase set with a distinctive board and sculpted pieces. A premium centrepiece for a dedicated games room.", "/images/Volcanic.png", "Commission edition", 2),
    ];

    public static async Task SeedAsync(GrandmastersDbContext database, CancellationToken cancellationToken = default)
    {
        if (!database.Database.IsNpgsql()) return;

        await using var transaction = await database.Database.BeginTransactionAsync(cancellationToken);
        await database.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(3712026);", cancellationToken);

        if (await database.Products.AnyAsync(product => product.Slug.StartsWith("demo-"), cancellationToken))
        {
            await transaction.CommitAsync(cancellationToken);
            return;
        }

        var categoryNames = Products.Select(product => product.Category).Distinct().ToArray();
        var categories = await database.Categories
            .Where(category => categoryNames.Contains(category.Name))
            .ToDictionaryAsync(category => category.Name, cancellationToken);

        foreach (var name in categoryNames.Where(name => !categories.ContainsKey(name)))
        {
            var category = new Category { Name = name };
            database.Categories.Add(category);
            categories[name] = category;
        }

        await database.SaveChangesAsync(cancellationToken);

        foreach (var seed in Products)
        {
            var product = new Product
            {
                Name = seed.Name,
                Slug = seed.Slug,
                Description = seed.Description,
                Price = seed.Price,
                CategoryId = categories[seed.Category].CategoryId,
                CreatedAt = DateTime.UtcNow,
            };

            product.Images.Add(new ProductImage { ImageUrl = seed.ImageUrl });
            product.Variants.Add(new ProductVariant
            {
                Name = seed.VariantName,
                Price = seed.Price,
                Inventory = new Inventory
                {
                    Quantity = seed.Quantity,
                    UpdatedAt = DateTime.UtcNow,
                },
            });

            database.Products.Add(product);
        }

        await database.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }
}
