"""Definition of the GlossaryFolder content type
"""

from zope.interface import implements, directlyProvides

from Products.Archetypes import atapi
from Products.ATContentTypes.content import folder
from Products.ATContentTypes.content import schemata

from tx.glossary import txMessageFactory as _
from tx.glossary.interfaces import IGlossaryFolder
from tx.glossary.config import PROJECTNAME

GlossaryFolderSchema = folder.ATFolderSchema.copy() + atapi.Schema((

    # -*- Your Archetypes field definitions here ... -*-

))

# Set storage on fields copied from ATFolderSchema, making sure
# they work well with the python bridge properties.

GlossaryFolderSchema['title'].storage = atapi.AnnotationStorage()
GlossaryFolderSchema['description'].storage = atapi.AnnotationStorage()

schemata.finalizeATCTSchema(
    GlossaryFolderSchema,
    folderish=True,
    moveDiscussion=False
)

class GlossaryFolder(folder.ATFolder):
    """A Folder for GlossaryItems"""
    implements(IGlossaryFolder)

    meta_type = "GlossaryFolder"
    schema = GlossaryFolderSchema

    title = atapi.ATFieldProperty('title')
    description = atapi.ATFieldProperty('description')
    
    # -*- Your ATSchema to Python Property Bridges Here ... -*-

atapi.registerType(GlossaryFolder, PROJECTNAME)
