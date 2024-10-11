using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;
using System.Text;
using Newtonsoft.Json;
using System.Reflection;
using System.Linq.Expressions;
using System.Collections.Generic;

namespace prevsup.Utils
{
    /// <summary>
    /// Utility class to save files to MongoDB. 
    /// <list type="bullet">
    ///     <item>
    ///         <term>T</term>
    ///         <description>Collection type</description>
    ///     </item>
    ///     <item>
    ///         <term>F</term>
    ///         <description>file type</description>
    ///     </item>
    /// </list>
    /// </summary>
    public class GridFSUtils<TCollection, TFile>
    {
        public GridFSBucket Bucket { get; set; }
        public string IdObject { get; set; }
        public FieldDefinition<TCollection, string> IdField { get; set; }
        public FieldDefinition<TCollection, string> FileField { get; set; }
        public string FileIdName { get; set; }

        private static object lockModif = new object();

        /// <summary>
        /// Constructeur
        /// <list type="bullet">
        ///     <item>
        ///         <term>idName</term>
        ///         <description>Nom de colonne de l'id de la collection</description>
        ///     </item>
        ///     <item>
        ///         <term>fileIdName</term>
        ///         <description>Nom de colonne de l'id du fichier</description>
        ///     </item>
        /// </list>
        /// </summary>
        /// <param name="database"></param>
        /// <param name="objectId"></param>
        /// <param name="IdName"></param>
        /// <param name="fileName">Propriétés </param>
        public GridFSUtils(IMongoDatabase database, string objectId, FieldDefinition<TCollection, string> idField, FieldDefinition<TCollection, string> fileField, string fileIdName)
        {

            IdObject = objectId;
            IdField = idField;
            FileField = fileField;
            Bucket = new GridFSBucket(database, new GridFSBucketOptions
            {
                // Préfixe des deux collections dans MongoDB prevsup.files, prevsup.chuncks
                BucketName = "prevsup"
            });
            FileIdName = fileIdName;
        }

        public long InsertOrUpdate(IMongoCollection<TCollection> collections, TFile fileToUpload, UpdateDefinition<TCollection> update)
        {
            lock (lockModif)
            {
                if (IdObject != null && IdObject.Length > 0)
                {
                    var foundDoc = collections.Find(GetFilter()).FirstOrDefault();
                    if (foundDoc != null)
                    {
                        // Supprimer les fichiers précédents
                        string idFile = getValue(foundDoc, FileIdName);
                        if (idFile != null && idFile != BsonUndefined.Value)
                        {
                            try
                            {
                                Bucket.Delete(new ObjectId(idFile));
                            }
                            catch (GridFSFileNotFoundException ex)
                            {
                                // TODO: Ne rien faire
                            }
                        }
                    }
                    else
                    {
                        /*
                        // TODO Si document n'existe pas alors l'insérer
                        var newAca = new AcademyData
                        {
                            aca = academyId,
                            Is_calculed = false
                        };
                        CAcademyDatas.InsertOne(newAca);
                        */
                    }
                }


                byte[] values = ObjectToByteArray(fileToUpload);
                var id = Bucket.UploadFromBytes(IdObject, values);

                var updateField = Builders<TCollection>.Update.Set(FileField, id.ToString());

                var updateList = new List<UpdateDefinition<TCollection>>() { updateField };
                if (update != null)
                {
                    updateList.Add(update);
                }

                var result = collections.UpdateOne(GetFilter(), Builders<TCollection>.Update.Combine(updateList), new UpdateOptions { IsUpsert = true });
                return result.ModifiedCount;
            }

        }

        public TCollection Find(IMongoCollection<TCollection> collections, string filePropName)
        {
            lock (lockModif)
            {

                TCollection result;
                result = collections.Find(GetFilter()).FirstOrDefault();
                if (result == null) return default(TCollection);

                string value = getValue(result, FileIdName);

                if (value != null && ObjectId.TryParse(value, out ObjectId id))
                {
                    setValue(result, filePropName, ByteArrayToObject(Bucket.DownloadAsBytes(id)));
                }


                return result;
            }

        }

        public TCollection Delete(IMongoCollection<TCollection> collections)
        {
            lock (lockModif)
            {
                TCollection result;
                result = collections.Find(GetFilter()).FirstOrDefault();
                if (result == null) return default(TCollection);

                string value = getValue(result, FileIdName);
                if (value != null && ObjectId.TryParse(value, out ObjectId id))
                {
                    Bucket.Delete(id);
                }
                collections.DeleteOne(GetFilter());
                return result;
            }
        }

        private string getValue(TCollection obj, string propName)
        {
            var type = typeof(TCollection);
            return type.GetProperty(propName)?.GetValue(obj)?.ToString();
        }

        private void setValue(TCollection obj, string propName, TFile value)
        {
            var type = typeof(TCollection);
            type.GetProperty(propName)?.SetValue(obj, value);
        }

        private FilterDefinition<TCollection> GetFilter()
        {
            return Builders<TCollection>.Filter.Eq(IdField, IdObject);
        }

        private byte[] ObjectToByteArray(TFile obj)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(obj));

            return bytes;
        }

        private TFile ByteArrayToObject(byte[] bytes)
        {
            return JsonConvert.DeserializeObject<TFile>(Encoding.UTF8.GetString(bytes));
        }
    }
}
