using Microsoft.EntityFrameworkCore;

namespace GBF.Server
{
    public class GBFDbContext : DbContext
    {
        public GBFDbContext(DbContextOptions<GBFDbContext> options) : base(options) { }

        public DbSet<User> Account { get; set; }
        public DbSet<GameCharacter> GameCharacter { get; set; }
        public DbSet<AccountCollection> AccountCollection { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite PK for AccountCollection
            modelBuilder.Entity<AccountCollection>()
                .HasKey(ac => new { ac.UserId, ac.CharacterId });

            // Ensure PK for GameCharacter
            modelBuilder.Entity<GameCharacter>()
                .HasKey(c => c.CharId);

            // Map table names explicitly (PostgreSQL is case-sensitive)
            modelBuilder.Entity<User>().ToTable("Account");
            modelBuilder.Entity<GameCharacter>().ToTable("GameCharacter");
            modelBuilder.Entity<AccountCollection>().ToTable("AccountCollection");

            // Configure relationships
            modelBuilder.Entity<AccountCollection>()
                .HasOne(ac => ac.Character)
                .WithMany(c => c.AccountCollections)
                .HasForeignKey(ac => ac.CharacterId);

            modelBuilder.Entity<AccountCollection>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(ac => ac.UserId);
        }
    }
}
