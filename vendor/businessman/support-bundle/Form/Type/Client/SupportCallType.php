<?php
namespace BusinessMan\Bundle\SupportBundle\Form\Type\Client;

use Doctrine\ORM\EntityRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * SupportCallType
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 */
class SupportCallType extends AbstractType
{
    /**
     * {@inheritDoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add(
            'client',
            'entity',
            array(
                'class' => 'BusinessManClientBundle:Client',
                'property' => 'name',
                'empty_value' => '',
                'query_builder' => function (EntityRepository $repository) use ($builder) {
                        $qb = $repository->createQueryBuilder('c');
                        $qb->addOrderBy('c.name', 'ASC');

                        if ($builder->getData()->getClient()) {
                            $qb->where('c.id != :client');
                            $qb->setParameter('client', $builder->getData()->getClient());
                        }

                        return $qb;
                    }
            )
        );

        $builder->add('save', 'submit');
    }

    /**
     * {@inheritDoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(
            array(
                'data_class' => 'BusinessMan\Bundle\SupportBundle\Entity\SupportCall',
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function getName()
    {
        return 'ticket';
    }
}
