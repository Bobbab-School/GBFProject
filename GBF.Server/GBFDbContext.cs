using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.EntityFrameworkCore;
using System;

namespace GBF.Server
{
    public class GBFDbContext:DbContext
    {
        public GBFDbContext(DbContextOptions<GBFDbContext> options) : base(options) { }

        public DbSet<User> Account { get; set; }

        public DbSet<GameCharacter> GameCharacter { get; set; }
        public DbSet<AccountCollection> AccountCollection { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AccountCollection>()
                .HasKey(ac => new { ac.UserId, ac.CharacterId });
            modelBuilder.Entity<GameCharacter>()
                .HasKey(c => c.CharId); // make sure CharId is PK

        }

    }
}
