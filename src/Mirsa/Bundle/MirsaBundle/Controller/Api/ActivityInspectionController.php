<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * ActivityInspectionController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class ActivityInspectionController extends AbstractRestController
{
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction(Request $request, $_format)
    {
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function totalsAction(Request $request, $_format)
    {
        $ia = $this->getDoctrine()->getRepository('MirsaMirsaBundle:ActivityInspection')
            ->createQueryBuilder('ia')
            ->select('SUM(ia.qtyInspected) as insTotal, SUM(ia.qtyRejected) as rejTotal')
            ->getQuery()
            ->getOneOrNullResult();

        var_dump($ia);

        return $this->render(
            'MirsaMirsaBundle:ActivityInspection:total.html.twig',
            array('insTotal' => $ia['insTotal'], 'rejTotal' => $ia['rejTotal'])
        );
    }
    
    /**
     * {@inheritDoc}
     */
    protected function getSummaryColumnNames() {
        return array('e.qtyInspected', 'e.qtyRejected');
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:ActivityInspection';
    }

   /**
     * Only fetch Inspection Work Orders records associated with the selected stock record
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        $qb->andWhere($alias . '.type IN (:type)');
        $qb->setParameter('type', array('Internal Inspection', 'Inspection', 'External Inspection'));

        return $qb;
    }
}